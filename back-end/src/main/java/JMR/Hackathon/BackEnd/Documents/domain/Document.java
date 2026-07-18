package JMR.Hackathon.BackEnd.Documents.domain;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
public class Document {

    private Long id;

    private String hash;

    private String title;

    private String content;

    private Float version;

    private Nivel nivel;





}
