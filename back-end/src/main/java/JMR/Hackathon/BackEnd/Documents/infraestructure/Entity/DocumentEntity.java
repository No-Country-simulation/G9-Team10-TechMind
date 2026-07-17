package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;


import JMR.Hackathon.BackEnd.Documents.domain.Nivel;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.List;

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


    private String hash;

    private String title;

    private String content;

    //ManytoMany
    private List<String> keywords;

    private Float version;

    private Nivel nivel;
}
