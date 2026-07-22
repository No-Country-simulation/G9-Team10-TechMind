package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;


import JMR.Hackathon.BackEnd.Documents.domain.Nivel;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Table(name="documents")
@Entity
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doc_id")
    private String docId;

    @Column(name = "trace_id")
    private String traceId;

    private String title;

    private String content;

    private String categoria;

    @Column(name = "probabilidad_categoria")
    private Float probabilidadCategoria;

    @Column(name = "lenguage")
    private String lenguage;

    private Float version;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel")
    private Nivel nivel;
}
