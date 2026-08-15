package JMR.Hackathon.BackEnd.Documents.api.mapper;

import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentoSimilitud;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.RecomendacionResponse;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@AllArgsConstructor
@Component
public class DocumentDTOMapper {

    // Convierte un Document de dominio a DocumentResponse sin keywords.

    public DocumentResponse ToResponse(Document document) {
        return new DocumentResponse(
                document.getDocID(),
                document.getTrace_id(),
                document.getTitle(),
                document.getContent(),
                document.getCategoria(),
                document.getProbabilidadCategoria(),
                document.getNivel() != null ? document.getNivel().name() : null,
                Collections.emptyList()
        );
    }

    // Convierte un Document de dominio a DocumentResponse incluyendo las keywords. Usado en el endpoint POST /create donde ya tenemos las keywords del análisis IA.

    public DocumentResponse ToResponseWithKeywords(Document document, List<String> keywords) {
        return new DocumentResponse(
                document.getDocID(),
                document.getTrace_id(),
                document.getTitle(),
                document.getContent(),
                document.getCategoria(),
                document.getProbabilidadCategoria(),
                document.getNivel() != null ? document.getNivel().name() : null,
                keywords != null ? keywords : Collections.emptyList()
        );
    }

    public Document ToDomain(DocumentRequest request) {
        return Document.builder()
                .title(request.title())
                .content(request.content())
                .build();
    }


}
