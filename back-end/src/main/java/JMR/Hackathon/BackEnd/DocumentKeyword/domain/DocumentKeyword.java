package JMR.Hackathon.BackEnd.DocumentKeyword.domain;


import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentKeyword {

    private Long documentId;

    private Long keywordId;
}
