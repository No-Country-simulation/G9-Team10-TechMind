package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;


import JMR.Hackathon.BackEnd.Documents.domain.dificultad;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String docID;

    private String title;

    private String content;

    private String lenguage;

    private Float version;

    private dificultad dificultad;
}
