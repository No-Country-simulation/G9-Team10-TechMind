package JMR.Hackathon.BackEnd.Keywords.ServiceTest;

import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.domain.exception.DocumentNotFoundException;
import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.KeywordService;
import JMR.Hackathon.BackEnd.Keywords.api.mapper.KeywordDTOMapper;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetKeywordsByTitleTest {

    @Mock private KeywordRepository keywordRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentKeywordRepository documentKeywordRepository;
    @Mock private KeywordDTOMapper mapperDTO;

    @InjectMocks
    private KeywordService service;

    // ─────────────────────────────────────────────
    // Escenario 1 — flujo feliz
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("getKeywordsByTitle() con título existente → retorna lista de keywords")
    void shouldReturnKeywordsByTitle() {
        Document document = Document.builder().id(1L).title("Spring Guide").build();
        Keyword kw1 = new Keyword(1L, "spring");
        Keyword kw2 = new Keyword(2L, "docker");
        KeywordResponse res1 = new KeywordResponse(1L, "spring");
        KeywordResponse res2 = new KeywordResponse(2L, "docker");

        when(documentRepository.FindByTitle("Spring Guide"))
                .thenReturn(Optional.of(document));
        when(documentKeywordRepository.findKeywordIdsByDocumentId(1L))
                .thenReturn(List.of(1L, 2L));
        // El service ahora usa findAllById en lugar del loop con findById
        when(keywordRepository.findAllById(List.of(1L, 2L)))
                .thenReturn(List.of(kw1, kw2));
        when(mapperDTO.ToResponse(kw1)).thenReturn(res1);
        when(mapperDTO.ToResponse(kw2)).thenReturn(res2);

        List<KeywordResponse> result = service.getKeywordsByTitle("Spring Guide");

        assertEquals(2, result.size());
        assertEquals(1L,      result.get(0).id());
        assertEquals("spring", result.get(0).keyword());
        assertEquals(2L,      result.get(1).id());
        assertEquals("docker", result.get(1).keyword());

        verify(documentRepository).FindByTitle("Spring Guide");
        verify(documentKeywordRepository).findKeywordIdsByDocumentId(1L);
        verify(keywordRepository).findAllById(List.of(1L, 2L));
        verify(mapperDTO).ToResponse(kw1);
        verify(mapperDTO).ToResponse(kw2);
    }

    // ─────────────────────────────────────────────
    // Escenario 2 — documento no existe
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("getKeywordsByTitle() con título inexistente → lanza DocumentNotFoundException")
    void shouldThrowExceptionWhenDocumentDoesNotExist() {
        when(documentRepository.FindByTitle("Spring Guide"))
                .thenReturn(Optional.empty());

        assertThrows(DocumentNotFoundException.class,
                () -> service.getKeywordsByTitle("Spring Guide"));

        verify(documentRepository).FindByTitle("Spring Guide");
        verify(documentKeywordRepository, never()).findKeywordIdsByDocumentId(anyLong());
        verify(keywordRepository, never()).findAllById(any());
        verify(mapperDTO, never()).ToResponse(any());
    }

    // ─────────────────────────────────────────────
    // Escenario 3 — documento sin keywords
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("getKeywordsByTitle() con documento sin keywords → retorna lista vacía")
    void shouldReturnEmpty_whenDocumentHasNoKeywords() {
        Document document = Document.builder().id(1L).title("Sin Keywords").build();

        when(documentRepository.FindByTitle("Sin Keywords"))
                .thenReturn(Optional.of(document));
        when(documentKeywordRepository.findKeywordIdsByDocumentId(1L))
                .thenReturn(Collections.emptyList());
        when(keywordRepository.findAllById(Collections.emptyList()))
                .thenReturn(Collections.emptyList());

        List<KeywordResponse> result = service.getKeywordsByTitle("Sin Keywords");

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verifyNoInteractions(mapperDTO);
    }
}
