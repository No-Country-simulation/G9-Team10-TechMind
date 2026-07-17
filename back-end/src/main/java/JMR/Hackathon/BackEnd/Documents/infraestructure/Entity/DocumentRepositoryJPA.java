package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;

import JMR.Hackathon.BackEnd.Documents.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentRepositoryJPA extends JpaRepository<DocumentEntity,Long> {

    Optional<DocumentEntity> save (DocumentEntity documentEntity);

    Optional<DocumentEntity> FindById(Long id);

    Optional<DocumentEntity> FindByTitle(String title);

    void delete(Long id);

    void deleteByTitle(String title);

    boolean existsByhash(String hash);

}
