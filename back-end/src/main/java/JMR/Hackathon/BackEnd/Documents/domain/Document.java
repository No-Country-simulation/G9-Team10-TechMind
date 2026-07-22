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

    private String trace_id;

    private String title;

    private String content;

    private String Categoria;

    private Float probabilidadCategoria;

    private String lenguage;

    private Float version;

    private Nivel nivel;





}
