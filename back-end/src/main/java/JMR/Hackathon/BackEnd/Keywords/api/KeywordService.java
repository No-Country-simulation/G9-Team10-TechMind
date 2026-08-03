package JMR.Hackathon.BackEnd.Keywords.api;

import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.domain.exception.DocumentNotFoundException;
import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.mapper.KeywordDTOMapper;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import JMR.Hackathon.BackEnd.Keywords.domain.exception.KeywordNotFoundException;
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


    public KeywordResponse findById(Long id){

        return keywordRepository.findById(id)
                .map(mapperDTO::ToResponse)
                .orElseThrow(()->new KeywordNotFoundException(id));

    }


    public KeywordResponse findByKeyword(String k){

        return keywordRepository.findByKeyword(k).map(mapperDTO::ToResponse)
                .orElseThrow(()->new KeywordNotFoundException(k));
    }

    public List<KeywordResponse> findAll(){

        return keywordRepository.findAll()
                .stream()
                .map(mapperDTO::ToResponse)
                .toList();

    }

    @Transactional
    public void deleteByKeyword(String k){

        keywordRepository.findByKeyword(k)
                .orElseThrow(()->new KeywordNotFoundException(k));

        keywordRepository.deleteByKeyword(k);
    }
    @Transactional
    public void deleteById(Long id){

        keywordRepository.findById(id)
                .orElseThrow(()->new KeywordNotFoundException(id));

        keywordRepository.deleteById(id);
    }


    public List<KeywordResponse> getKeywordsByTitle(String title) {

        Document document = documentRepository.FindByTitle(title)
                .orElseThrow(()->new DocumentNotFoundException(title));

        List<Long> kID  =documentKeywordRepository.findKeywordIdsByDocumentId(document.getId());

        System.out.println(kID);

        List<KeywordResponse> K = keywordRepository.findAllById(kID)
                .stream()
                .map(mapperDTO::ToResponse)
                .toList();

        return K;


    }
}
