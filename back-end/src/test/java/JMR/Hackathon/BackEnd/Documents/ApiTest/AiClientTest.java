package JMR.Hackathon.BackEnd.Documents.ApiTest;

import JMR.Hackathon.BackEnd.Documents.api.AiClient;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisResponse;
import JMR.Hackathon.BackEnd.Documents.domain.exception.AiServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class AiClientTest {

    private MockRestServiceServer mockServer;
    private AiClient aiClient;

    private static final String BASE_URL   = "http://localhost:8000";
    private static final String ANALYZE_URL = BASE_URL + "/api/v1/analyze";

    @BeforeEach
    void setUp() {
        // Construimos el RestClient con un builder interceptable
        // y lo exponemos para que MockRestServiceServer lo controle
        RestClient.Builder builder = RestClient.builder().baseUrl(BASE_URL);
        mockServer = MockRestServiceServer.bindTo(builder).build();
        aiClient   = new AiClient(builder);
    }

    // ─────────────────────────────────────────────
    // Escenario 1 — FastAPI responde 200 con JSON válido
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("analyze() → deserializa correctamente la respuesta cuando FastAPI responde 200")
    void shouldReturnResponse_whenFastApiReturns200() {
        mockServer.expect(requestTo(ANALYZE_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess("""
                        {
                          "Titulo":               "Redes Neuronales",
                          "Texto":                "Una red neuronal es un modelo computacional.",
                          "Categoria":            "Inteligencia Artificial",
                          "probabilidadCategoria": 0.95,
                          "Nivel":                "Avanzado",
                          "keywords":             ["red neuronal", "ia", "modelo"],
                          "version":              "1.0",
                          "trace_id":             "trace-abc",
                          "doc_id":               "doc-xyz"
                        }
                        """, MediaType.APPLICATION_JSON));

        AiAnalysisResponse result = aiClient.analyze(
                "Redes Neuronales",
                "Una red neuronal es un modelo computacional.");

        assertNotNull(result);
        assertEquals("Redes Neuronales",        result.titulo());
        assertEquals("Inteligencia Artificial", result.categoria());
        assertEquals(0.95f, result.probabilidadCategoria(), 0.001f);
        assertEquals("Avanzado",                result.nivel());
        assertEquals("trace-abc",               result.traceId());
        assertEquals("doc-xyz",                 result.docId());
        assertEquals(3,                         result.keywords().size());
        assertEquals("red neuronal",            result.keywords().get(0));

        mockServer.verify();
    }

    // ─────────────────────────────────────────────
    // Escenario 2 — FastAPI responde 400
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("analyze() → lanza AiServiceException con mensaje 4xx cuando FastAPI responde 400")
    void shouldThrowAiServiceException_whenFastApiReturns400() {
        mockServer.expect(requestTo(ANALYZE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"detail\": \"texto no puede estar vacío\"}"));

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> aiClient.analyze("Titulo", ""));

        assertTrue(ex.getMessage().contains("400"),
                "El mensaje debe indicar el código HTTP 400");
        assertTrue(ex.getMessage().contains("rechazó"),
                "El mensaje debe indicar que el microservicio rechazó la solicitud");
    }

    // ─────────────────────────────────────────────
    // Escenario 3 — FastAPI responde 500
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("analyze() → lanza AiServiceException con mensaje 5xx cuando FastAPI responde 500")
    void shouldThrowAiServiceException_whenFastApiReturns500() {
        mockServer.expect(requestTo(ANALYZE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"detail\": \"internal server error\"}"));

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> aiClient.analyze("Titulo", "Texto de prueba."));

        assertTrue(ex.getMessage().contains("500"),
                "El mensaje debe indicar el código HTTP 500");
        assertTrue(ex.getMessage().contains("error interno"),
                "El mensaje debe indicar error interno del microservicio");
    }

    // ─────────────────────────────────────────────
    // Escenario 4 — FastAPI responde 503
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("analyze() → lanza AiServiceException con mensaje 5xx cuando FastAPI responde 503")
    void shouldThrowAiServiceException_whenFastApiReturns503() {
        mockServer.expect(requestTo(ANALYZE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"detail\": \"service unavailable\"}"));

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> aiClient.analyze("Titulo", "Texto de prueba."));

        assertTrue(ex.getMessage().contains("503"),
                "El mensaje debe indicar el código HTTP 503");
    }

    // ─────────────────────────────────────────────
    // Escenario 5 — keywords vacías en la respuesta
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("analyze() → deserializa correctamente cuando FastAPI retorna keywords vacías")
    void shouldHandleEmptyKeywords_whenFastApiReturnsEmptyList() {
        mockServer.expect(requestTo(ANALYZE_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {
                          "Titulo":               "Documento sin keywords",
                          "Texto":                "Texto corto.",
                          "Categoria":            "General",
                          "probabilidadCategoria": 0.5,
                          "Nivel":                "Principiante",
                          "keywords":             [],
                          "version":              "1.0",
                          "trace_id":             "trace-000",
                          "doc_id":               "doc-000"
                        }
                        """, MediaType.APPLICATION_JSON));

        AiAnalysisResponse result = aiClient.analyze("Documento sin keywords", "Texto corto.");

        assertNotNull(result);
        assertNotNull(result.keywords());
        assertTrue(result.keywords().isEmpty());
    }
}
