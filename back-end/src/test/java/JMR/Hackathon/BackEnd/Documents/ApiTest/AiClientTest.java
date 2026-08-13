package JMR.Hackathon.BackEnd.Documents.ApiTest;

import JMR.Hackathon.BackEnd.Documents.api.AiClient;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisResponse;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.RecomendacionResponse;
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

    // ─────────────────────────────────────────────
    // search() — flujo feliz
    // ─────────────────────────────────────────────

    private static final String SEARCH_URL    = BASE_URL + "/api/v1/search";
    private static final String RECOMMEND_URL = BASE_URL + "/api/v1/recommend";

    private static final String RECOMENDACION_RESPONSE_JSON = """
            {
              "resultados": [
                {
                  "doc_id":           "doc-001",
                  "title":            "Introducción a Java",
                  "source_type":      "PDF",
                  "similarity_score": 0.97,
                  "preview":          "Java es un lenguaje de programación orientado a objetos..."
                },
                {
                  "doc_id":           "doc-002",
                  "title":            "Spring Boot Avanzado",
                  "source_type":      "TXT",
                  "similarity_score": 0.88,
                  "preview":          "Spring Boot facilita la creación de aplicaciones..."
                }
              ],
              "trace_id": "trace-search-1"
            }
            """;

    @Test
    @DisplayName("search() → deserializa correctamente la lista de resultados cuando FastAPI responde 200")
    void shouldReturnResults_whenSearchReturns200() {
        mockServer.expect(requestTo(SEARCH_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(RECOMENDACION_RESPONSE_JSON, MediaType.APPLICATION_JSON));

        RecomendacionResponse result = aiClient.search("programación en Java", 5);

        assertNotNull(result);
        assertEquals("trace-search-1", result.traceId());
        assertEquals(2, result.resultados().size());
        assertEquals("doc-001",              result.resultados().get(0).docId());
        assertEquals("Introducción a Java",  result.resultados().get(0).title());
        assertEquals(0.97f, result.resultados().get(0).similarityScore(), 0.001f);
        assertEquals("PDF",                  result.resultados().get(0).sourceType());

        mockServer.verify();
    }

    @Test
    @DisplayName("search() → lanza AiServiceException cuando FastAPI responde 500")
    void shouldThrow_whenSearchReturns500() {
        mockServer.expect(requestTo(SEARCH_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"detail\": \"model not loaded\"}"));

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> aiClient.search("texto de prueba", 3));

        assertTrue(ex.getMessage().contains("500"));
        assertTrue(ex.getMessage().contains("error interno"));
    }

    @Test
    @DisplayName("search() → lanza AiServiceException cuando FastAPI no está disponible")
    void shouldThrow_whenSearchServiceIsDown() {
        AiClient clientDown = new AiClient("http://localhost:19998");

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> clientDown.search("texto de prueba", 3));

        assertTrue(ex.getMessage().contains("No se pudo conectar"));
    }

    // ─────────────────────────────────────────────
    // recommend() — flujo feliz
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("recommend() → deserializa correctamente la lista de resultados cuando FastAPI responde 200")
    void shouldReturnResults_whenRecommendReturns200() {
        mockServer.expect(requestTo(RECOMMEND_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(RECOMENDACION_RESPONSE_JSON, MediaType.APPLICATION_JSON));

        RecomendacionResponse result = aiClient.recommend("doc-abc-123", 3);

        assertNotNull(result);
        assertEquals("trace-search-1", result.traceId());
        assertEquals(2, result.resultados().size());
        assertEquals("doc-002",                result.resultados().get(1).docId());
        assertEquals("Spring Boot Avanzado",   result.resultados().get(1).title());
        assertEquals(0.88f, result.resultados().get(1).similarityScore(), 0.001f);

        mockServer.verify();
    }

    @Test
    @DisplayName("recommend() → lanza AiServiceException cuando FastAPI responde 404 (doc_id no encontrado)")
    void shouldThrow_whenRecommendReturns404() {
        mockServer.expect(requestTo(RECOMMEND_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"detail\": \"documento no encontrado\"}"));

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> aiClient.recommend("doc-inexistente", 3));

        assertTrue(ex.getMessage().contains("404"));
        assertTrue(ex.getMessage().contains("rechazó"));
    }

    @Test
    @DisplayName("recommend() → lanza AiServiceException cuando FastAPI no está disponible")
    void shouldThrow_whenRecommendServiceIsDown() {
        AiClient clientDown = new AiClient("http://localhost:19997");

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> clientDown.recommend("doc-abc", 3));

        assertTrue(ex.getMessage().contains("No se pudo conectar"));
    }
}
