package JMR.Hackathon.BackEnd.Documents.ServiceTest;

import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.api.AiClient;
import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.mapper.DocumentDTOMapper;
import JMR.Hackathon.BackEnd.Documents.api.saveKeywords;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Nivel;
import JMR.Hackathon.BackEnd.Documents.domain.exception.DocumentNotFoundException;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Hasher;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceGetTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private saveKeywords saveKeywords;
    @Mock private NormalizedText textNormalizer;
    @Mock private Hasher hasher;
    @Mock private DocumentDTOMapper dtoMapper;
    @Mock private DocumentKeywordRepository documentKeywordRepository;
    @Mock private KeywordRepository keywordRepository;
    @Mock private AiClient aiClient;

    @InjectMocks
    private DocumentService service;

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    private Document buildDocument(Long id, String title) {
        return Document.builder()
                .id(id)
                .docID("doc-" + id)
                .title(title)
                .content("Contenido de prueba.")
                .Categoria("Tecnología")
                .probabilidadCategoria(0.88f)
                .nivel(Nivel.Intermedio)
                .build();
    }

    private DocumentResponse buildResponse(Long id, String title) {
        return new DocumentResponse(
                "doc-" + id, "trace-" + id,
                title, "Contenido de prueba.",
                "Tecnología", 0.88f, "Intermedio",
                Collections.emptyList()
        );
    }

    // ─────────────────────────────────────────────
    // getDocumentById
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("getDocumentById() con ID existente → retorna DocumentResponse")
    void shouldReturnDocument_whenIdExists() {
        Document doc = buildDocument(1L, "Spring Boot");
        DocumentResponse expected = buildResponse(1L, "Spring Boot");

        when(documentRepository.FindById(1L)).thenReturn(Optional.of(doc));
        when(dtoMapper.ToResponse(doc)).thenReturn(expected);

        DocumentResponse result = service.getDocumentById(1L);

        assertEquals("doc-1", result.docId());
        assertEquals("Spring Boot", result.title());
        verify(documentRepository).FindById(1L);
        verify(dtoMapper).ToResponse(doc);
    }

    @Test
    @DisplayName("getDocumentById() con ID inexistente → lanza DocumentNotFoundException")
    void shouldThrow_whenIdDoesNotExist() {
        when(documentRepository.FindById(99L)).thenReturn(Optional.empty());

        DocumentNotFoundException ex = assertThrows(DocumentNotFoundException.class,
                () -> service.getDocumentById(99L));

        assertTrue(ex.getMessage().contains("99"));
        verify(documentRepository).FindById(99L);
        verifyNoInteractions(dtoMapper);
    }

    // ─────────────────────────────────────────────
    // getDocumentByTitle
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("getDocumentByTitle() con título existente → retorna DocumentResponse")
    void shouldReturnDocument_whenTitleExists() {
        Document doc = buildDocument(2L, "Docker Avanzado");
        DocumentResponse expected = buildResponse(2L, "Docker Avanzado");

        when(documentRepository.FindByTitle("Docker Avanzado")).thenReturn(Optional.of(doc));
        when(dtoMapper.ToResponse(doc)).thenReturn(expected);

        DocumentResponse result = service.getDocumentByTitle("Docker Avanzado");

        assertEquals("Docker Avanzado", result.title());
        verify(documentRepository).FindByTitle("Docker Avanzado");
    }

    @Test
    @DisplayName("getDocumentByTitle() con título inexistente → lanza DocumentNotFoundException")
    void shouldThrow_whenTitleDoesNotExist() {
        when(documentRepository.FindByTitle("Titulo Inexistente")).thenReturn(Optional.empty());

        DocumentNotFoundException ex = assertThrows(DocumentNotFoundException.class,
                () -> service.getDocumentByTitle("Titulo Inexistente"));

        assertTrue(ex.getMessage().contains("Titulo Inexistente"));
        verifyNoInteractions(dtoMapper);
    }

    // ─────────────────────────────────────────────
    // getAllDocuments
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("getAllDocuments() con documentos → retorna lista completa")
    void shouldReturnAllDocuments_whenRepositoryHasData() {
        Document doc1 = buildDocument(1L, "Java");
        Document doc2 = buildDocument(2L, "Python");
        DocumentResponse res1 = buildResponse(1L, "Java");
        DocumentResponse res2 = buildResponse(2L, "Python");

        when(documentRepository.findAll()).thenReturn(List.of(doc1, doc2));
        when(dtoMapper.ToResponse(doc1)).thenReturn(res1);
        when(dtoMapper.ToResponse(doc2)).thenReturn(res2);

        List<DocumentResponse> result = service.getAllDocuments();

        assertEquals(2, result.size());
        assertEquals("Java",   result.get(0).title());
        assertEquals("Python", result.get(1).title());
        verify(documentRepository).findAll();
        verify(dtoMapper, times(2)).ToResponse(any());
    }

    @Test
    @DisplayName("getAllDocuments() sin documentos → retorna lista vacía")
    void shouldReturnEmptyList_whenRepositoryIsEmpty() {
        when(documentRepository.findAll()).thenReturn(Collections.emptyList());

        List<DocumentResponse> result = service.getAllDocuments();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(documentRepository).findAll();
        verifyNoInteractions(dtoMapper);
    }
}
