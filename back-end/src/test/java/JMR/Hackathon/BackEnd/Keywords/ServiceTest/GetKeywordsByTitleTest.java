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
import JMR.Hackathon.BackEnd.Keywords.domain.exception.KeywordNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
@ExtendWith(MockitoExtension.class)
class GetKeywordsByTitleTest {

    @Mock
    private KeywordRepository keywordRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DocumentKeywordRepository documentKeywordRepository;

    @Mock
    private KeywordDTOMapper mapperDTO;

    @InjectMocks
    private KeywordService service;

    @Test
    void shouldReturnKeywordsByTitle() {

        Document document = Document.builder()
                .id(1L)
                .title("Spring Guide")
                .build();

        Keyword keyword1 = new Keyword(1L, "spring");
        Keyword keyword2 = new Keyword(2L, "docker");

        KeywordResponse response1 = new KeywordResponse(1L, "spring");
        KeywordResponse response2 = new KeywordResponse(2L, "docker");

        when(documentRepository.FindByTitle("Spring Guide"))
                .thenReturn(Optional.of(document));

        when(documentKeywordRepository.findKeywordIdsByDocumentId(1L))
                .thenReturn(List.of(1L, 2L));

        when(keywordRepository.findById(1L))
                .thenReturn(Optional.of(keyword1));

        when(keywordRepository.findById(2L))
                .thenReturn(Optional.of(keyword2));

        when(mapperDTO.ToResponse(keyword1))
                .thenReturn(response1);

        when(mapperDTO.ToResponse(keyword2))
                .thenReturn(response2);

        // Act
        List<KeywordResponse> result = service.getKeywordsByTitle("Spring Guide");

        // Assert
        assertEquals(2, result.size());

        assertEquals(1L, result.get(0).id());
        assertEquals("spring", result.get(0).keyword());

        assertEquals(2L, result.get(1).id());
        assertEquals("docker", result.get(1).keyword());

        // Verify
        verify(documentRepository).FindByTitle("Spring Guide");
        verify(documentKeywordRepository).findKeywordIdsByDocumentId(1L);

        verify(keywordRepository).findById(1L);
        verify(keywordRepository).findById(2L);

        verify(mapperDTO).ToResponse(keyword1);
        verify(mapperDTO).ToResponse(keyword2);
    }

    @Test
    void shouldThrowExceptionWhenDocumentDoesNotExist() {

        // Arrange
        when(documentRepository.FindByTitle("Spring Guide"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                DocumentNotFoundException.class,
                () -> service.getKeywordsByTitle("Spring Guide")
        );

        // Verify
        verify(documentRepository).FindByTitle("Spring Guide");

        verify(documentKeywordRepository, never())
                .findKeywordIdsByDocumentId(anyLong());

        verify(keywordRepository, never())
                .findById(anyLong());

        verify(mapperDTO, never())
                .ToResponse(any());
    }

    @Test
    void shouldThrowExceptionWhenKeywordDoesNotExist() {

        Document document = Document.builder()
                .id(1L)
                .title("Spring Guide")
                .build();

        when(documentRepository.FindByTitle("Spring Guide"))
                .thenReturn(Optional.of(document));

        when(documentKeywordRepository.findKeywordIdsByDocumentId(1L))
                .thenReturn(List.of(1L));

        when(keywordRepository.findById(1L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                KeywordNotFoundException.class,
                () -> service.getKeywordsByTitle("Spring Guide")
        );

        // Verify
        verify(documentRepository).FindByTitle("Spring Guide");
        verify(documentKeywordRepository).findKeywordIdsByDocumentId(1L);
        verify(keywordRepository).findById(1L);

        verify(mapperDTO, never())
                .ToResponse(any());
    }
}
