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
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import JMR.Hackathon.BackEnd.Keywords.domain.exception.KeywordNotFoundException;
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
class DocumentServiceGetByKeywordTest {

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

    private Document buildDocument(Long id, String title) {
        return Document.builder()
                .id(id).docID("doc-" + id).title(title)
                .content("Contenido.").Categoria("Tech")
                .probabilidadCategoria(0.9f).nivel(Nivel.Intermedio)
                .build();
    }

    private DocumentResponse buildResponse(Long id, String title) {
        return new DocumentResponse("doc-" + id, "trace-" + id,
                title, "Contenido.", "Tech", 0.9f, "Intermedio",
                Collections.emptyList());
    }

    @Test
    @DisplayName("getDocumentByKeyword() con keyword existente y documentos → retorna lista de respuestas")
    void shouldReturnDocuments_whenKeywordExistsAndHasDocuments() {
        Keyword kw = new Keyword(10L, "java");
        Document doc1 = buildDocument(1L, "Java Basics");
        Document doc2 = buildDocument(2L, "Java Avanzado");
        DocumentResponse res1 = buildResponse(1L, "Java Basics");
        DocumentResponse res2 = buildResponse(2L, "Java Avanzado");

        when(keywordRepository.findByKeyword("java")).thenReturn(Optional.of(kw));
        when(documentKeywordRepository.findDocumentIdsByKeywordId(10L)).thenReturn(List.of(1L, 2L));
        when(documentRepository.FindById(1L)).thenReturn(Optional.of(doc1));
        when(documentRepository.FindById(2L)).thenReturn(Optional.of(doc2));
        when(dtoMapper.ToResponse(doc1)).thenReturn(res1);
        when(dtoMapper.ToResponse(doc2)).thenReturn(res2);

        List<DocumentResponse> result = service.getDocumentByKeyword("java");

        assertEquals(2, result.size());
        assertEquals("Java Basics",   result.get(0).title());
        assertEquals("Java Avanzado", result.get(1).title());
        verify(keywordRepository).findByKeyword("java");
        verify(documentKeywordRepository).findDocumentIdsByKeywordId(10L);
    }

    @Test
    @DisplayName("getDocumentByKeyword() con keyword inexistente → lanza KeywordNotFoundException")
    void shouldThrow_whenKeywordDoesNotExist() {
        when(keywordRepository.findByKeyword("kotlin")).thenReturn(Optional.empty());

        KeywordNotFoundException ex = assertThrows(KeywordNotFoundException.class,
                () -> service.getDocumentByKeyword("kotlin"));

        assertTrue(ex.getMessage().contains("kotlin"));
        verifyNoInteractions(documentKeywordRepository, documentRepository, dtoMapper);
    }

    @Test
    @DisplayName("getDocumentByKeyword() con keyword existente pero sin documentos → retorna lista vacía")
    void shouldReturnEmpty_whenKeywordHasNoDocuments() {
        Keyword kw = new Keyword(5L, "haskell");

        when(keywordRepository.findByKeyword("haskell")).thenReturn(Optional.of(kw));
        when(documentKeywordRepository.findDocumentIdsByKeywordId(5L)).thenReturn(Collections.emptyList());

        List<DocumentResponse> result = service.getDocumentByKeyword("haskell");

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verifyNoInteractions(documentRepository, dtoMapper);
    }

    @Test
    @DisplayName("getDocumentByKeyword() cuando uno de los documentos no existe → lanza DocumentNotFoundException")
    void shouldThrow_whenDocumentInListDoesNotExist() {
        Keyword kw = new Keyword(7L, "docker");

        when(keywordRepository.findByKeyword("docker")).thenReturn(Optional.of(kw));
        when(documentKeywordRepository.findDocumentIdsByKeywordId(7L)).thenReturn(List.of(1L, 99L));
        when(documentRepository.FindById(1L)).thenReturn(Optional.of(buildDocument(1L, "Docker Intro")));
        when(documentRepository.FindById(99L)).thenReturn(Optional.empty());
        when(dtoMapper.ToResponse(any())).thenReturn(buildResponse(1L, "Docker Intro"));

        assertThrows(DocumentNotFoundException.class,
                () -> service.getDocumentByKeyword("docker"));
    }
}
