package JMR.Hackathon.BackEnd.Documents.api;

import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

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

    /**
     * Llama a POST /api/v1/analyze del microservicio Python.
     * Retorna la clasificación, probabilidad, nivel y keywords del texto.
     */
    public AiAnalysisResponse analyze(String titulo, String texto) {
        AiAnalysisRequest request = AiAnalysisRequest.builder()
                .titulo(titulo)
                .texto(texto)
                .build();

        return restClient.post()
                .uri("/api/v1/analyze")
                .body(request)
                .retrieve()
                .body(AiAnalysisResponse.class);
    }
}
