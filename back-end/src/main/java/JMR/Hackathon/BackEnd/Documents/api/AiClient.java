package JMR.Hackathon.BackEnd.Documents.api;

import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisResponse;
import JMR.Hackathon.BackEnd.Documents.domain.exception.AiServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Cliente HTTP que llama al microservicio FastAPI de Python (TechMind AI API).
 * URL configurable via application.properties: ai.api.url
 */
@Component
public class AiClient {

    private final RestClient restClient;

    public AiClient(@Value("${ai.api.url:http://localhost:8000}") String aiBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(aiBaseUrl)
                .build();
    }

    /** Constructor para tests — permite inyectar un RestClient.Builder
     * ya configurado con un MockRestServiceServer.
     */
    public AiClient(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    /**
     * Llama a POST /api/v1/analyze del microservicio Python.
     * Retorna la clasificación, probabilidad, nivel y keywords del texto.
     *
     * @throws AiServiceException si el microservicio devuelve un error HTTP
     *                            o no está disponible (timeout, conexión rechazada).
     */
    public AiAnalysisResponse analyze(String titulo, String texto) {
        AiAnalysisRequest request = AiAnalysisRequest.builder()
                .titulo(titulo)
                .texto(texto)
                .build();

        try {
            return restClient.post()
                    .uri("/api/v1/analyze")
                    .body(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), (req, res) -> {
                        throw new AiServiceException(
                                "El microservicio de análisis rechazó la solicitud (HTTP " + res.getStatusCode().value() + "). " +
                                "Verifica que el texto y título sean válidos."
                        );
                    })
                    .onStatus(status -> status.is5xxServerError(), (req, res) -> {
                        throw new AiServiceException(
                                "El microservicio de análisis reportó un error interno (HTTP " + res.getStatusCode().value() + "). " +
                                "Intenta nuevamente más tarde."
                        );
                    })
                    .body(AiAnalysisResponse.class);

        } catch (AiServiceException e) {
            // Re-lanzar sin wrappear para preservar el mensaje original
            throw e;
        } catch (ResourceAccessException e) {
            // Conexión rechazada, timeout o microservicio caído
            throw new AiServiceException(
                    "No se pudo conectar al microservicio de análisis. Verifica que el servicio esté activo.", e
            );
        } catch (RestClientResponseException e) {
            // Respuesta HTTP inesperada no cubierta por onStatus()
            throw new AiServiceException(
                    "Respuesta inesperada del microservicio de análisis (HTTP " + e.getStatusCode().value() + ").", e
            );
        }
    }
}
