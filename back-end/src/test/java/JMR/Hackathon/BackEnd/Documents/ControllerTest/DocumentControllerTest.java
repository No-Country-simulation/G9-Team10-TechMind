package JMR.Hackathon.BackEnd.Documents.ControllerTest;

import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.controller.DocumentController;
import JMR.Hackathon.BackEnd.Documents.domain.exception.AiServiceException;
import JMR.Hackathon.BackEnd.Documents.domain.exception.DocumentNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
    // GET /document/all
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /document/all → 200 con lista de documentos")
    void shouldReturn200WithList_whenDocumentsExist() throws Exception {
        DocumentResponse r1 = buildResponse("doc-1", "trace-1", "Java Guide");
        DocumentResponse r2 = buildResponse("doc-2", "trace-2", "Spring Boot");

        when(service.getAllDocuments()).thenReturn(List.of(r1, r2));

        mockMvc.perform(get("/document/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Java Guide"))
                .andExpect(jsonPath("$[1].title").value("Spring Boot"));

        verify(service).getAllDocuments();
    }

    @Test
    @DisplayName("GET /document/all → 200 con lista vacía cuando no hay documentos")
    void shouldReturn200WithEmptyList_whenNoDocumentsExist() throws Exception {
        when(service.getAllDocuments()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/document/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(service).getAllDocuments();
    }

    // ─────────────────────────────────────────────
    // GET /document/id/{id}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /document/id/{id} → 200 con documento cuando el ID existe")
    void shouldReturn200_whenDocumentIdExists() throws Exception {
        DocumentResponse response = buildResponse("doc-1", "trace-1", "Docker Intro");
        when(service.getDocumentById(1L)).thenReturn(response);

        mockMvc.perform(get("/document/id/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.docId").value("doc-1"))
                .andExpect(jsonPath("$.title").value("Docker Intro"));

        verify(service).getDocumentById(1L);
    }

    @Test
    @DisplayName("GET /document/id/{id} → 404 cuando el documento no existe")
    void shouldReturn404_whenDocumentIdNotFound() throws Exception {
        when(service.getDocumentById(99L)).thenThrow(new DocumentNotFoundException(99L));

        mockMvc.perform(get("/document/id/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(service).getDocumentById(99L);
    }

    @Test
    @DisplayName("GET /document/id/0 → 400 por violación de @Min(1)")
    void shouldReturn400_whenIdIsZero() throws Exception {
        mockMvc.perform(get("/document/id/0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(service);
    }

    @Test
    @DisplayName("GET /document/id/-5 → 400 por violación de @Min(1)")
    void shouldReturn400_whenIdIsNegative() throws Exception {
        mockMvc.perform(get("/document/id/-5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(service);
    }

    // ─────────────────────────────────────────────
    // GET /document/title/{title}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /document/title/{title} → 200 con documento cuando el título existe")
    void shouldReturn200_whenTitleExists() throws Exception {
        DocumentResponse response = buildResponse("doc-5", "trace-5", "Kubernetes");
        when(service.getDocumentByTitle("Kubernetes")).thenReturn(response);

        mockMvc.perform(get("/document/title/Kubernetes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Kubernetes"));

        verify(service).getDocumentByTitle("Kubernetes");
    }

    @Test
    @DisplayName("GET /document/title/{title} → 404 cuando el título no existe")
    void shouldReturn404_whenTitleNotFound() throws Exception {
        when(service.getDocumentByTitle("Inexistente"))
                .thenThrow(new DocumentNotFoundException("Inexistente"));

        mockMvc.perform(get("/document/title/Inexistente"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(service).getDocumentByTitle("Inexistente");
    }

    // ─────────────────────────────────────────────
    // GET /document/keyword/{keyword}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /document/keyword/{keyword} → 200 con lista de documentos")
    void shouldReturn200WithList_whenKeywordExists() throws Exception {
        DocumentResponse r1 = buildResponse("doc-3", "trace-3", "Java Avanzado");
        when(service.getDocumentByKeyword("java")).thenReturn(List.of(r1));

        mockMvc.perform(get("/document/keyword/java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Java Avanzado"));

        verify(service).getDocumentByKeyword("java");
    }

    // ─────────────────────────────────────────────
    // DELETE /document/id/{id}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /document/id/{id} → 200 cuando el documento existe")
    void shouldReturn200_whenDeleteById() throws Exception {
        doNothing().when(service).deleteDocumentById(1L);

        mockMvc.perform(delete("/document/id/1"))
                .andExpect(status().isOk());

        verify(service).deleteDocumentById(1L);
    }

    @Test
    @DisplayName("DELETE /document/id/{id} → 404 cuando el documento no existe")
    void shouldReturn404_whenDeleteByIdNotFound() throws Exception {
        doThrow(new DocumentNotFoundException(99L)).when(service).deleteDocumentById(99L);

        mockMvc.perform(delete("/document/id/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(service).deleteDocumentById(99L);
    }

    @Test
    @DisplayName("DELETE /document/id/0 → 400 por violación de @Min(1)")
    void shouldReturn400_whenDeleteByIdIsZero() throws Exception {
        mockMvc.perform(delete("/document/id/0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(service);
    }

    // ─────────────────────────────────────────────
    // DELETE /document/title/{title}
    // ─────────────────────────────────────────────

//    @Test
//    @DisplayName("DELETE /document/title/{title} → 200 cuando el documento existe")
//    void shouldReturn200_whenDeleteByTitle() throws Exception {
//        doNothing().when(service).deleteDocumentByTitle("Spring Boot");
//
//        mockMvc.perform(delete("/document/title/Spring Boot"))
//                .andExpect(status().isOk());
//
//        verify(service).deleteDocumentByTitle("Spring Boot");
//    }
//
//    @Test
//    @DisplayName("DELETE /document/title/{title} → 404 cuando el título no existe")
//    void shouldReturn404_whenDeleteByTitleNotFound() throws Exception {
//        doThrow(new DocumentNotFoundException("Titulo Inexistente"))
//                .when(service).deleteDocumentByTitle("Titulo Inexistente");
//
//        mockMvc.perform(delete("/document/title/Titulo Inexistente"))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.status").value(404));
//
//        verify(service).deleteDocumentByTitle("Titulo Inexistente");
//    }

    // ─────────────────────────────────────────────
    // Helper privado compartido
    // ─────────────────────────────────────────────

    private DocumentResponse buildResponse(String docId, String traceId, String title) {
        return new DocumentResponse(docId, traceId, title,
                "Contenido de prueba.", "Tecnología", 0.9f,
                "Intermedio", Collections.emptyList());
    }
}
