package JMR.Hackathon.BackEnd.Documents.infraestructure.Mapper;

import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Entity.DocumentEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@AllArgsConstructor
@Component
public class DocumentMapper {

    public Document ToDomain(DocumentEntity entity){
        Document d = new Document();
        d.setId(entity.getId());
        d.setDocID(entity.getDocId());
        d.setTrace_id(entity.getTraceId());
        d.setTitle(entity.getTitle());
        d.setContent(entity.getContent());
        d.setCategoria(entity.getCategoria());
        d.setProbabilidadCategoria(entity.getProbabilidadCategoria());
        d.setLenguage(entity.getLenguage());
        d.setVersion(entity.getVersion());
        d.setNivel(entity.getNivel());
        return d;
    }

    public DocumentEntity ToEntity(Document d){
        DocumentEntity e = new DocumentEntity();
        e.setId(d.getId());
        e.setDocId(d.getDocID());
        e.setTraceId(d.getTrace_id());
        e.setTitle(d.getTitle());
        e.setContent(d.getContent());
        e.setCategoria(d.getCategoria());
        e.setProbabilidadCategoria(d.getProbabilidadCategoria());
        e.setLenguage(d.getLenguage());
        e.setVersion(d.getVersion());
        e.setNivel(d.getNivel());
        return e;
    }


}
