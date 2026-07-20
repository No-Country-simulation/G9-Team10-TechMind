package JMR.Hackathon.BackEnd.Keywords.api;

import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.mapper.KeywordDTOMapper;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class KeywordService {

    private final KeywordRepository keywordRepository;

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

    public void deleteByKeyword(String k){
        keywordRepository.deleteByKeyword(k);
    }

    public void deleteById(Long id){
        keywordRepository.deleteById(id);
    }







}
