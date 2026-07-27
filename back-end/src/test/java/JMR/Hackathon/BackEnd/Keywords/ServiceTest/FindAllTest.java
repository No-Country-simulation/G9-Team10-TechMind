package JMR.Hackathon.BackEnd.Keywords.ServiceTest;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.KeywordService;
import JMR.Hackathon.BackEnd.Keywords.api.mapper.KeywordDTOMapper;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FindAllTest {
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
    void shouldReturnAllKeywords() {

        Keyword keyword1 = new Keyword(1L, "spring");

        Keyword keyword2 = new Keyword(2L, "docker");

        KeywordResponse response1 =
                new KeywordResponse(1L, "spring");

        KeywordResponse response2 =
                new KeywordResponse(2L, "docker");

        when(keywordRepository.findAll())
                .thenReturn(List.of(keyword1, keyword2));

        when(mapperDTO.ToResponse(keyword1))
                .thenReturn(response1);

        when(mapperDTO.ToResponse(keyword2))
                .thenReturn(response2);



        List<KeywordResponse> result =  service.findAll();

        KeywordResponse result1 = result.get(0);
        KeywordResponse result2 = result.get(1);

        assertEquals(1L, result1.id());
        assertEquals("spring", result1.keyword());

        assertEquals(2L, result2.id());
        assertEquals("docker", result2.keyword());

        verify(keywordRepository).findAll();

        verify(mapperDTO).ToResponse(keyword1);
        verify(mapperDTO).ToResponse(keyword2);


    }



}
