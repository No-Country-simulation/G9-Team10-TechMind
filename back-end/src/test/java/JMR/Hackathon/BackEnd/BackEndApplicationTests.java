package JMR.Hackathon.BackEnd;

import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Keywords.api.KeywordService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * Smoke test: verifica que la capa web de Spring arranca correctamente
 * sin necesitar base de datos.
 */
@WebMvcTest
class BackEndApplicationTests {
   
    @MockitoBean
    private DocumentService documentService;

    @MockitoBean
    private KeywordService keywordService;

    @Test
    void contextLoads() {
        // Si el contexto MVC levanta sin excepción, el test pasa.
    }

}
