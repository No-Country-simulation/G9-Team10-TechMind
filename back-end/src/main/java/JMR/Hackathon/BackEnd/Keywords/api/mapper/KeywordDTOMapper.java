package JMR.Hackathon.BackEnd.Keywords.api.mapper;


import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@AllArgsConstructor
@Component
public class KeywordDTOMapper {


    public KeywordResponse ToResponse(Keyword keyword){
        return new KeywordResponse(keyword.getId(),keyword.getKeyword());

    }


}
