package JMR.Hackathon.BackEnd.Documents.infraestructure.Mapper;

import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Entity.DocumentEntity;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public Document ToDomain(DocumentEntity entity){
        Document d = new Document();
        d.setId(entity.getId());
        d.setDocID(entity.getDocID());
        d.setContent(entity.getContent());
        d.setTitle(entity.getTitle());
        d.setDificultad(entity.getDificultad());
        d.setVersion(entity.getVersion());
        return d;
    }

    public DocumentEntity ToEntity(Document d){
        DocumentEntity e = new DocumentEntity();
        e.setId(d.getId());
        e.setDocID(d.getDocID());
        e.setContent(d.getContent());
        e.setTitle(d.getTitle());
        e.setDificultad(d.getDificultad());
        e.setVersion(d.getVersion());
        return e;
    }


}
