package JMR.Hackathon.BackEnd.Documents.api.mapper;


import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@NoArgsConstructor
@AllArgsConstructor
@Component
public class DocumentDTOMapper {

     public DocumentResponse ToResponse(Document document){

        return new DocumentResponse(
                document.getTitle(),
                document.getContent()
        );

    }

    public Document ToDomain(DocumentRequest resquest){
        return Document.builder()
                .title(resquest.title())
                .content(resquest.content())
                .version(resquest.version())
                .dificultad(resquest.dificultad())
                .build();
    }


}
