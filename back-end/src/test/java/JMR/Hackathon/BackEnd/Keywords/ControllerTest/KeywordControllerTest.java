package JMR.Hackathon.BackEnd.Keywords.ControllerTest;

import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.KeywordService;
import JMR.Hackathon.BackEnd.Keywords.api.controller.KeywordController;
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


}
