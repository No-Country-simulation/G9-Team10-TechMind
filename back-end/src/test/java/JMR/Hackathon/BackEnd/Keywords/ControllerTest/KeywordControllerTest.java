package JMR.Hackathon.BackEnd.Keywords.ControllerTest;

import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.KeywordService;
import JMR.Hackathon.BackEnd.Keywords.api.controller.KeywordController;
import JMR.Hackathon.BackEnd.Keywords.domain.exception.KeywordNotFoundException;
import JMR.Hackathon.BackEnd.Documents.domain.exception.DocumentNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(KeywordController.class)
public class KeywordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private KeywordService service;


    @Test
    void shouldReturnKeywordById() throws Exception {

        KeywordResponse response = new KeywordResponse(
                1L,
                "spring"
        );

        when(service.findById(1L))
                .thenReturn(response);

        mockMvc.perform(get("/keyword/id/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.keyword").value("spring"));

        verify(service).findById(1L);
    }

    @Test
    void shouldReturnKeyword() throws Exception {

        KeywordResponse response = new KeywordResponse(
                1L,
                "java"
        );

        when(service.findByKeyword("java"))
                .thenReturn(response);

        mockMvc.perform(get("/keyword/keyword/java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keyword").value("java"));

        verify(service).findByKeyword("java");
    }


    @Test
    void shouldReturnAllKeywords() throws Exception {

        List<KeywordResponse> list = List.of(
                new KeywordResponse(1L, "java"),
                new KeywordResponse(2L, "spring")
        );

        when(service.findAll())
                .thenReturn(list);

        mockMvc.perform(get("/keyword/findAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].keyword").value("java"))
                .andExpect(jsonPath("$[1].keyword").value("spring"));

        verify(service).findAll();
    }

    @Test
    void shouldReturnKeywordsByTitle() throws Exception {

        List<KeywordResponse> list = List.of(
                new KeywordResponse(1L, "docker"),
                new KeywordResponse(2L, "kubernetes")
        );

        when(service.getKeywordsByTitle("DevOps"))
                .thenReturn(list);

        mockMvc.perform(get("/keyword/title/DevOps"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(service).getKeywordsByTitle("DevOps");
    }

    @Test
    void shouldDeleteById() throws Exception {

        doNothing().when(service).deleteById(1L);

        mockMvc.perform(delete("/keyword/id/1"))
                .andExpect(status().isOk());

        verify(service).deleteById(1L);
    }

    @Test
    void shouldDeleteByKeyword() throws Exception {

        doNothing().when(service).deleteByKeyword("spring");

        mockMvc.perform(delete("/keyword/keyword/spring"))
                .andExpect(status().isOk());

        verify(service).deleteByKeyword("spring");
    }

    // ─────────────────────────────────────────────
    // Escenarios de error — GET /keyword/id/{id}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /keyword/id/{id} → 404 cuando la keyword no existe")
    void shouldReturn404_whenKeywordByIdNotFound() throws Exception {
        when(service.findById(99L)).thenThrow(new KeywordNotFoundException(99L));

        mockMvc.perform(get("/keyword/id/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(service).findById(99L);
    }

    // ─────────────────────────────────────────────
    // Escenarios de error — GET /keyword/keyword/{keyword}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /keyword/keyword/{keyword} → 404 cuando la keyword no existe")
    void shouldReturn404_whenKeywordByNameNotFound() throws Exception {
        when(service.findByKeyword("rust")).thenThrow(new KeywordNotFoundException("rust"));

        mockMvc.perform(get("/keyword/keyword/rust"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Keyword not found: rust"));

        verify(service).findByKeyword("rust");
    }

    // ─────────────────────────────────────────────
    // Escenarios de error — GET /keyword/title/{title}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /keyword/title/{title} → 404 cuando el documento no existe")
    void shouldReturn404_whenDocumentByTitleNotFound() throws Exception {
        when(service.getKeywordsByTitle("Titulo Inexistente"))
                .thenThrow(new DocumentNotFoundException("Titulo Inexistente"));

        mockMvc.perform(get("/keyword/title/Titulo Inexistente"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(service).getKeywordsByTitle("Titulo Inexistente");
    }

    // ─────────────────────────────────────────────
    // Escenarios de error — DELETE /keyword/id/{id}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /keyword/id/{id} → 404 cuando la keyword no existe")
    void shouldReturn404_whenDeleteByIdNotFound() throws Exception {
        doThrow(new KeywordNotFoundException(99L)).when(service).deleteById(99L);

        mockMvc.perform(delete("/keyword/id/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(service).deleteById(99L);
    }

    // ─────────────────────────────────────────────
    // Escenarios de error — DELETE /keyword/keyword/{keyword}
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /keyword/keyword/{keyword} → 404 cuando la keyword no existe")
    void shouldReturn404_whenDeleteByKeywordNotFound() throws Exception {
        doThrow(new KeywordNotFoundException("cobol")).when(service).deleteByKeyword("cobol");

        mockMvc.perform(delete("/keyword/keyword/cobol"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Keyword not found: cobol"));

        verify(service).deleteByKeyword("cobol");
    }

    // ─────────────────────────────────────────────
    // GET /keyword/findAll — lista vacía
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /keyword/findAll → 200 con lista vacía cuando no hay keywords")
    void shouldReturn200WithEmptyList_whenNoKeywordsExist() throws Exception {
        when(service.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/keyword/findAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(service).findAll();
    }
}
