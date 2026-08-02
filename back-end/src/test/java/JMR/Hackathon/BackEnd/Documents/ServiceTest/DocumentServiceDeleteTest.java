package JMR.Hackathon.BackEnd.Documents.ServiceTest;

import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.api.AiClient;
import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Documents.api.mapper.DocumentDTOMapper;
import JMR.Hackathon.BackEnd.Documents.api.saveKeywords;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceDeleteTest {

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
    // deleteDocumentById
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("deleteDocumentById() con ID existente → llama a repository.delete()")
    void shouldDelete_whenIdExists() {
        Document doc = Document.builder().id(1L).title("Java Guide").build();

        when(documentRepository.FindById(1L)).thenReturn(Optional.of(doc));
        doNothing().when(documentRepository).delete(1L);

        assertDoesNotThrow(() -> service.deleteDocumentById(1L));

        verify(documentRepository).FindById(1L);
        verify(documentRepository).delete(1L);
    }

    @Test
    @DisplayName("deleteDocumentById() con ID inexistente → lanza DocumentNotFoundException sin llamar a delete()")
    void shouldThrow_whenIdDoesNotExist() {
        when(documentRepository.FindById(99L)).thenReturn(Optional.empty());

        DocumentNotFoundException ex = assertThrows(DocumentNotFoundException.class,
                () -> service.deleteDocumentById(99L));

        assertTrue(ex.getMessage().contains("99"));
        verify(documentRepository).FindById(99L);
        verify(documentRepository, never()).delete(anyLong());
    }

    // ─────────────────────────────────────────────
    // deleteDocumentByTitle
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("deleteDocumentByTitle() con título existente → llama a repository.deleteByTitle()")
    void shouldDelete_whenTitleExists() {
        Document doc = Document.builder().id(1L).title("Spring Security").build();

        when(documentRepository.FindByTitle("Spring Security")).thenReturn(Optional.of(doc));
        doNothing().when(documentRepository).deleteByTitle("Spring Security");

        assertDoesNotThrow(() -> service.deleteDocumentByTitle("Spring Security"));

        verify(documentRepository).FindByTitle("Spring Security");
        verify(documentRepository).deleteByTitle("Spring Security");
    }

    @Test
    @DisplayName("deleteDocumentByTitle() con título inexistente → lanza DocumentNotFoundException sin llamar a deleteByTitle()")
    void shouldThrow_whenTitleDoesNotExist() {
        when(documentRepository.FindByTitle("Titulo Inexistente")).thenReturn(Optional.empty());

        DocumentNotFoundException ex = assertThrows(DocumentNotFoundException.class,
                () -> service.deleteDocumentByTitle("Titulo Inexistente"));

        assertTrue(ex.getMessage().contains("Titulo Inexistente"));
        verify(documentRepository).FindByTitle("Titulo Inexistente");
        verify(documentRepository, never()).deleteByTitle(anyString());
    }
}
