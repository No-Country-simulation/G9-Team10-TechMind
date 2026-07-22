package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;

import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;

public interface DocumentRepositoryJPA extends JpaRepository<DocumentEntity,Long> {

    Optional<DocumentEntity> findById(Long id);

    Optional<DocumentEntity> findByTitle(String title);


    void deleteByTitle(String title);


    List<DocumentEntity> findAll();

}
