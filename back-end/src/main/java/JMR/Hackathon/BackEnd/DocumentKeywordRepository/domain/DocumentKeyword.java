package JMR.Hackathon.BackEnd.DocumentKeywordRepository.domain;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DocumentKeyword {

    private Long documentId;

    private Long keywordId;
}
