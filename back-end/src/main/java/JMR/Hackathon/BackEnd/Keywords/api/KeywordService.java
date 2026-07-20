package JMR.Hackathon.BackEnd.Keywords.api;

import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.mapper.KeywordDTOMapper;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Service
public class KeywordService {

    private final KeywordRepository keywordRepository;

    private final DocumentRepository documentRepository;

    private final DocumentKeywordRepository documentKeywordRepository;

    private final KeywordDTOMapper mapperDTO;


    public KeywordResponse FindById(Long id){

        return keywordRepository.FindById(id)
                .map(mapperDTO::ToResponse)
                .orElseThrow();

    }


    public KeywordResponse FindByKeyword(String k){

        return keywordRepository.FindByKeyword(k).map(mapperDTO::ToResponse)
                .orElseThrow();

    }

    public List<KeywordResponse> FindAll(){

        return keywordRepository.findAll()
                .stream()
                .map(mapperDTO::ToResponse)
                .toList();

    }

    @Transactional
    public void deleteByKeyword(String k){
        keywordRepository.deleteByKeyword(k);
    }
    @Transactional
    public void deleteById(Long id){
        keywordRepository.deleteById(id);
    }


    public List<KeywordResponse> getKeywordsByTitle(String title) {

        Document document = documentRepository.FindByTitle(title)
                .orElseThrow();

        List<Long> kID  =documentKeywordRepository.findKeywordIdsByDocumentId(document.getId());

        List<KeywordResponse> K = new ArrayList<>();

        for(Long id : kID){

            Keyword keyword = keywordRepository.FindById(id)
                    .orElseThrow();
            K.add(mapperDTO.ToResponse(keyword));
        }

        return K;



    }
}
