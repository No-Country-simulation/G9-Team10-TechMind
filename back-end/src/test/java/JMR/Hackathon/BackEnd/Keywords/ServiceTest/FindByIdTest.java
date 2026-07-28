package JMR.Hackathon.BackEnd.Keywords.ServiceTest;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FindByIdTest {

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


    private final Long ID = 1L;

    private static final String KEYWORD = "spring";

    @Test
    void shouldReturnKeywordWhenIdExists() {

        Keyword keyword = new Keyword(ID, KEYWORD);

        KeywordResponse response =
                new KeywordResponse(ID, KEYWORD);

        when(keywordRepository.findById(ID))
                .thenReturn(Optional.of(keyword));

        when(mapperDTO.ToResponse(keyword))
                .thenReturn(response);

        KeywordResponse result = service.findById(ID);

        assertEquals(ID, result.id());
        assertEquals(KEYWORD, result.keyword());

        verify(keywordRepository).findById(ID);
        verify(mapperDTO).ToResponse(keyword);
    }


    @Test
    void shouldThrowExceptionWhenKeywordDoesNotExist() {

        when(keywordRepository.findById(ID))
                .thenReturn(Optional.empty());

        assertThrows(
                KeywordNotFoundException.class,
                () -> service.findById(ID)
        );

        verify(keywordRepository).findById(ID);

        verify(mapperDTO, never())
                .ToResponse(any());
    }



}
