package JMR.Hackathon.BackEnd.Documents.domain;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository {

    Optional<Document> save(Document document);

    Optional<Document> FindById(Long id);

    Optional<Document> FindByTitle(String title);

    Optional<Document> FindByHash(String hash);

    void delete(Long id);

    void deleteByTitle(String title);

    boolean existsByHash(String hash);

    List<Document> findAll();

}
