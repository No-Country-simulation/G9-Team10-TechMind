package JMR.Hackathon.BackEnd.Documents.MapperTest;

import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.mapper.DocumentDTOMapper;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Nivel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DocumentDTOMapperTest {

    private DocumentDTOMapper mapper;


    @BeforeEach
    void setUp() {
        mapper = new DocumentDTOMapper();


    }

    // ─────────────────────────────────────────────
    // Helper — documento completo de prueba
    // ─────────────────────────────────────────────

    private Document buildDocument(Nivel nivel) {
        return Document.builder()
                .id(1L)
                .docID("doc-123")
                .trace_id("trace-456")
                .title("Redes Neuronales")
                .content("Una red neuronal es un modelo computacional.")
                .Categoria("Inteligencia Artificial")
                .probabilidadCategoria(0.92f)
                .nivel(nivel)
                .build();
    }

    // ─────────────────────────────────────────────
    // ToResponse — mapeo de campos
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("ToResponse → mapea todos los campos correctamente")
    void toResponse_shouldMapAllFields() {
        Document document = buildDocument(Nivel.Avanzado);

        DocumentResponse response = mapper.ToResponse(document);

        assertEquals("doc-123",            response.docId());
        assertEquals("trace-456",          response.traceId());
        assertEquals("Redes Neuronales",   response.title());
        assertEquals("Una red neuronal es un modelo computacional.", response.content());
        assertEquals("Inteligencia Artificial", response.categoria());
        assertEquals(0.92f,                response.probabilidadCategoria());
        assertEquals("Avanzado",           response.nivel());
    }

    @Test
    @DisplayName("ToResponse → keywords siempre es lista vacía")
    void toResponse_shouldReturnEmptyKeywordsList() {
        Document document = buildDocument(Nivel.Intermedio);

        DocumentResponse response = mapper.ToResponse(document);

        assertNotNull(response.keywords());
        assertTrue(response.keywords().isEmpty());
    }

    @Test
    @DisplayName("ToResponse con nivel null → campo nivel es null en la respuesta")
    void toResponse_shouldReturnNullNivel_whenNivelIsNull() {
        Document document = buildDocument(null);

        DocumentResponse response = mapper.ToResponse(document);

        assertNull(response.nivel());
    }

    @Test
    @DisplayName("ToResponse → el nombre del nivel es el nombre exacto del enum")
    void toResponse_shouldUseEnumName_forNivel() {
        assertEquals("Principiante", mapper.ToResponse(buildDocument(Nivel.Principiante)).nivel());
        assertEquals("Intermedio",   mapper.ToResponse(buildDocument(Nivel.Intermedio)).nivel());
        assertEquals("Avanzado",     mapper.ToResponse(buildDocument(Nivel.Avanzado)).nivel());
    }

    // ─────────────────────────────────────────────
    // ToResponseWithKeywords — manejo de keywords
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("ToResponseWithKeywords con lista de keywords → las incluye en la respuesta")
    void toResponseWithKeywords_shouldIncludeKeywords() {
        Document document = buildDocument(Nivel.Avanzado);
        List<String> keywords = List.of("red neuronal", "backpropagation", "gradiente");

        DocumentResponse response = mapper.ToResponseWithKeywords(document, keywords);

        assertEquals(3, response.keywords().size());
        assertEquals("red neuronal",    response.keywords().get(0));
        assertEquals("backpropagation", response.keywords().get(1));
        assertEquals("gradiente",       response.keywords().get(2));
    }

    @Test
    @DisplayName("ToResponseWithKeywords con keywords null → retorna lista vacía, no NPE")
    void toResponseWithKeywords_shouldReturnEmpty_whenKeywordsIsNull() {
        Document document = buildDocument(Nivel.Intermedio);

        DocumentResponse response = mapper.ToResponseWithKeywords(document, null);

        assertNotNull(response.keywords());
        assertTrue(response.keywords().isEmpty());
    }

    @Test
    @DisplayName("ToResponseWithKeywords con lista vacía → retorna lista vacía")
    void toResponseWithKeywords_shouldReturnEmpty_whenKeywordsIsEmpty() {
        Document document = buildDocument(Nivel.Intermedio);

        DocumentResponse response = mapper.ToResponseWithKeywords(document, List.of());

        assertNotNull(response.keywords());
        assertTrue(response.keywords().isEmpty());
    }

    @Test
    @DisplayName("ToResponseWithKeywords → mapea correctamente los demás campos")
    void toResponseWithKeywords_shouldMapAllFieldsCorrectly() {
        Document document = buildDocument(Nivel.Principiante);

        DocumentResponse response = mapper.ToResponseWithKeywords(document, List.of("java"));

        assertEquals("doc-123",  response.docId());
        assertEquals("trace-456", response.traceId());
        assertEquals("Redes Neuronales", response.title());
        assertEquals("Principiante", response.nivel());
    }

    // ─────────────────────────────────────────────
    // ToDomain — construcción desde request
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("ToDomain → mapea title y content desde DocumentRequest")
    void toDomain_shouldMapTitleAndContent() {
        DocumentRequest request = new DocumentRequest("Spring Boot", "Framework de Java para aplicaciones web.");

        Document domain = mapper.ToDomain(request);

        assertEquals("Spring Boot", domain.getTitle());
        assertEquals("Framework de Java para aplicaciones web.", domain.getContent());
    }

    @Test
    @DisplayName("ToDomain → los demás campos quedan en null por defecto")
    void toDomain_shouldLeaveOtherFieldsAsNull() {
        DocumentRequest request = new DocumentRequest("Titulo", "Contenido.");

        Document domain = mapper.ToDomain(request);

        assertNull(domain.getDocID());
        assertNull(domain.getTrace_id());
        assertNull(domain.getCategoria());
        assertNull(domain.getNivel());
    }
}
