package JMR.Hackathon.BackEnd.Documents.ControllerTest;

import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.controller.DocumentController;
import JMR.Hackathon.BackEnd.Documents.domain.exception.AiServiceException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocumentController.class)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocumentService service;

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private static final String ENDPOINT = "/document/create";

    private static final String VALID_BODY = """
            {
              "title": "Redes Neuronales",
              "content": "Una red neuronal es un modelo computacional inspirado en el cerebro humano."
            }
            """;

    private static final String MISSING_TITLE_BODY = """
            {
              "title": "",
              "content": "Contenido válido del documento de prueba."
            }
            """;

    private static final String MISSING_CONTENT_BODY = """
            {
              "title": "Título válido",
              "content": ""
            }
            """;

    // ─────────────────────────────────────────────
    // Escenario 1 — Flujo feliz
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("POST /document/create → 200 con docId y keywords cuando FastAPI responde OK")
    void shouldReturn200WithDocumentResponse_whenFastApiRespondsOk() throws Exception {

        DocumentResponse mockResponse = new DocumentResponse(
                "doc-abc-123",
                "trace-xyz-456",
                "Redes Neuronales",
                "Una red neuronal es un modelo computacional inspirado en el cerebro humano.",
                "Inteligencia Artificial",
                0.95f,
                "AVANZADO",
                List.of("red neuronal", "inteligencia artificial", "modelo computacional")
        );

        when(service.create(any())).thenReturn(mockResponse);

        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.docId").value("doc-abc-123"))
                .andExpect(jsonPath("$.traceId").value("trace-xyz-456"))
                .andExpect(jsonPath("$.title").value("Redes Neuronales"))
                .andExpect(jsonPath("$.categoria").value("Inteligencia Artificial"))
                .andExpect(jsonPath("$.probabilidadCategoria").value(0.95))
                .andExpect(jsonPath("$.nivel").value("AVANZADO"))
                .andExpect(jsonPath("$.keywords.length()").value(3))
                .andExpect(jsonPath("$.keywords[0]").value("red neuronal"));

        verify(service).create(any());
    }

    // ─────────────────────────────────────────────
    // Escenario 2 — FastAPI caído
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("POST /document/create → 503 con mensaje cuando FastAPI no está disponible")
    void shouldReturn503_whenFastApiIsDown() throws Exception {

        when(service.create(any()))
                .thenThrow(new AiServiceException(
                        "No se pudo conectar al microservicio de análisis. Verifica que el servicio esté activo."
                ));

        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.error").value("Service Unavailable"))
                .andExpect(jsonPath("$.message").value(
                        "No se pudo conectar al microservicio de análisis. Verifica que el servicio esté activo."
                ))
                .andExpect(jsonPath("$.path").value(ENDPOINT));

        verify(service).create(any());
    }

    // ─────────────────────────────────────────────
    // Escenario 3 — FastAPI responde con error HTTP
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("POST /document/create → 503 con mensaje cuando FastAPI responde con error 5xx")
    void shouldReturn503_whenFastApiReturnsServerError() throws Exception {

        when(service.create(any()))
                .thenThrow(new AiServiceException(
                        "El microservicio de análisis reportó un error interno (HTTP 500). Intenta nuevamente más tarde."
                ));

        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.message").value(
                        "El microservicio de análisis reportó un error interno (HTTP 500). Intenta nuevamente más tarde."
                ));

        verify(service).create(any());
    }

    // ─────────────────────────────────────────────
    // Escenario 4 — Validación de request: título vacío
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("POST /document/create → 400 cuando el título viene vacío")
    void shouldReturn400_whenTitleIsBlank() throws Exception {

        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(MISSING_TITLE_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(service);
    }

    // ─────────────────────────────────────────────
    // Escenario 5 — Validación de request: contenido vacío
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("POST /document/create → 400 cuando el contenido viene vacío")
    void shouldReturn400_whenContentIsBlank() throws Exception {

        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(MISSING_CONTENT_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(service);
    }
}
