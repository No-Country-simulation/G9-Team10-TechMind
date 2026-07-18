package JMR.Hackathon.BackEnd.DocumentKeywordRepository.infraestructure;


import JMR.Hackathon.BackEnd.DocumentKeywordRepository.domain.DocumentKeyword;
import org.springframework.stereotype.Component;

@Component
public class DocumentKeywordMapper {


    public DocumentKeyword ToDomain(DocumentKeywordEntity e) {
        return DocumentKeyword.builder()
                .documentId(e.getDocumentId())
                .keywordId(e.getKeywordId())
                .build();
    }

    public DocumentKeywordEntity ToEntity(DocumentKeyword d) {
        return DocumentKeywordEntity.builder()
                .documentId(d.getDocumentId())
                .keywordId(d.getKeywordId())
                .build();

    }
}
