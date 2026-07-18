package JMR.Hackathon.BackEnd.Documents.infraestructure.Mapper;

import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Entity.DocumentEntity;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public Document ToDomain(DocumentEntity entity){
        Document d = new Document();
        d.setId(entity.getId());
        d.setHash(entity.getHash());
        d.setContent(entity.getContent());
        d.setTitle(entity.getTitle());
        d.setNivel(entity.getNivel());
        d.setVersion(entity.getVersion());
        return d;
    }

    public DocumentEntity ToEntity(Document d){
        DocumentEntity e = new DocumentEntity();
        e.setId(d.getId());
        e.setHash(d.getHash());
        e.setContent(d.getContent());
        e.setTitle(d.getTitle());
        e.setNivel(d.getNivel());
        e.setVersion(d.getVersion());
        return e;
    }


}
