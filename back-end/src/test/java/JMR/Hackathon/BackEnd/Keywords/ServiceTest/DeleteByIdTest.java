package JMR.Hackathon.BackEnd.Keywords.ServiceTest;


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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DeleteByIdTest {

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
    void shouldDeleteById()
    {
        Keyword keyword = new Keyword(1L, "spring");

        when(keywordRepository.findById(1L))
                .thenReturn(Optional.of(keyword));

        doNothing().when(keywordRepository).deleteById(1L);

        service.deleteById(1L);

        verify(keywordRepository).findById(1L);
        verify(keywordRepository).deleteById(1L);

    }

    @Test
    void shouldThrowExceptionWhenKeywordDoesNotExist() {


        when(keywordRepository.findById(1L))
                .thenReturn(Optional.empty());


        assertThrows(
                KeywordNotFoundException.class,
                () -> service.deleteById(1L)
        );


        verify(keywordRepository).findById(1L);
        verify(keywordRepository, never()).deleteById(anyLong());
    }
}
