package JMR.Hackathon.BackEnd.Documents.api;

import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisResponse;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.RecomendacionResponse;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.RecommendRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.SearchRequest;
import JMR.Hackathon.BackEnd.Documents.domain.exception.AiServiceException;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
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

    public AiClient() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8000")
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

    /**
     * Llama a POST /api/v1/search del microservicio Python.
     * Busca documentos semánticamente similares a un texto libre.
     *
     * @param query Texto de búsqueda en lenguaje natural
     * @param topK  Número máximo de resultados a retornar
     * @throws AiServiceException si el microservicio no está disponible o responde con error.
     */
    public RecomendacionResponse search(String query, int topK) {
        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .build();

        try {
            return restClient.post()
                    .uri("/api/v1/search")
                    .body(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), (req, res) -> {
                        throw new AiServiceException(
                                "El microservicio de búsqueda rechazó la solicitud (HTTP " + res.getStatusCode().value() + "). " +
                                "Verifica que la query sea válida."
                        );
                    })
                    .onStatus(status -> status.is5xxServerError(), (req, res) -> {
                        throw new AiServiceException(
                                "El microservicio de búsqueda reportó un error interno (HTTP " + res.getStatusCode().value() + "). " +
                                "Intenta nuevamente más tarde."
                        );
                    })
                    .body(RecomendacionResponse.class);

        } catch (AiServiceException e) {
            throw e;
        } catch (ResourceAccessException e) {
            throw new AiServiceException(
                    "No se pudo conectar al microservicio de búsqueda. Verifica que el servicio esté activo.", e
            );
        } catch (RestClientResponseException e) {
            throw new AiServiceException(
                    "Respuesta inesperada del microservicio de búsqueda (HTTP " + e.getStatusCode().value() + ").", e
            );
        }
    }

    /**
     * Llama a POST /api/v1/recommend del microservicio Python.
     * Busca documentos similares a un documento existente usando su doc_id.
     *
     * @param docId doc_id del documento base para la recomendación
     * @param topK  Número máximo de resultados a retornar
     * @throws AiServiceException si el microservicio no está disponible o responde con error.
     */
    public RecomendacionResponse recommend(String docId, int topK) {
        RecommendRequest request = RecommendRequest.builder()
                .docId(docId)
                .topK(topK)
                .build();

        try {
            return restClient.post()
                    .uri("/api/v1/recommend")
                    .body(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), (req, res) -> {
                        throw new AiServiceException(
                                "El microservicio de recomendación rechazó la solicitud (HTTP " + res.getStatusCode().value() + "). " +
                                "Verifica que el doc_id sea válido."
                        );
                    })
                    .onStatus(status -> status.is5xxServerError(), (req, res) -> {
                        throw new AiServiceException(
                                "El microservicio de recomendación reportó un error interno (HTTP " + res.getStatusCode().value() + "). " +
                                "Intenta nuevamente más tarde."
                        );
                    })
                    .body(RecomendacionResponse.class);

        } catch (AiServiceException e) {
            throw e;
        } catch (ResourceAccessException e) {
            throw new AiServiceException(
                    "No se pudo conectar al microservicio de recomendación. Verifica que el servicio esté activo.", e
            );
        } catch (RestClientResponseException e) {
            throw new AiServiceException(
                    "Respuesta inesperada del microservicio de recomendación (HTTP " + e.getStatusCode().value() + ").", e
            );
        }
    }
}
