package JMR.Hackathon.BackEnd.Keywords.infraestructure.mapper;


import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.infraestructure.Entity.KeywordEntity;
import org.springframework.stereotype.Component;

@Component
public class KeywordMapper {

    public Keyword ToDomain(KeywordEntity e){
        return Keyword.builder()
                .id(e.getId())
                .keyword(e.getKeyword())
                .build();

    }

    public KeywordEntity ToEntity(Keyword d){

        return KeywordEntity.builder()
                .id(d.getId())
                .keyword(d.getKeyword())
                .build();

    }



}
