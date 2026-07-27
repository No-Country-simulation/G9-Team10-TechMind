package JMR.Hackathon.BackEnd.Keywords.ServiceTest;


import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
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

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class DeleteByKeywordTest {

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
    void shouldDeleteKeywordWhenKeywordExists() {

        // Arrange
        Keyword keyword = new Keyword(1L, "spring");

        when(keywordRepository.findByKeyword("spring"))
                .thenReturn(Optional.of(keyword));

        doNothing().when(keywordRepository).deleteByKeyword("spring");

        // Act
        service.deleteByKeyword("spring");

        // Verify
        verify(keywordRepository).findByKeyword("spring");
        verify(keywordRepository).deleteByKeyword("spring");
    }

    @Test
    void shouldThrowExceptionWhenKeywordDoesNotExist() {

        // Arrange
        when(keywordRepository.findByKeyword("spring"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                KeywordNotFoundException.class,
                () -> service.deleteByKeyword("spring")
        );

        // Verify
        verify(keywordRepository).findByKeyword("spring");
        verify(keywordRepository, never()).deleteByKeyword(anyString());
    }



}
