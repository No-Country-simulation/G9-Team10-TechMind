package JMR.Hackathon.BackEnd.Documents.domain;

import lombok.*;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
public class Document {

    private Long id;

    private String docID;

    private String title;

    private String content;

    private String lenguage;

    private Float version;

    private dificultad dificultad;





}
