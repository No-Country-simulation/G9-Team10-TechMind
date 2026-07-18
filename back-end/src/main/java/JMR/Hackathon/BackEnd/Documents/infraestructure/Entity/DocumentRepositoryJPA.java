package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;

import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;

public interface DocumentRepositoryJPA extends JpaRepository<DocumentEntity,Long> {

    Optional<DocumentEntity> save (DocumentEntity documentEntity);

    Optional<DocumentEntity> FindById(Long id);

    Optional<DocumentEntity> FindByTitle(String title);

    Optional<DocumentEntity> FindByHash(String hash);

    void delete(Long id);

    void deleteByTitle(String title);

    boolean existsByhash(String hash);

    List<DocumentEntity> findAll();

}
