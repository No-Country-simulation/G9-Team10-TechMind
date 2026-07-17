package JMR.Hackathon.BackEnd.Documents.domain;

import java.util.Optional;

public interface DocumentRepository {

    Optional<Document> save(Document document);

    Optional<Document> FindById(Long id);

    Optional<Document> FindByTitle(String title);

    void delete(Long id);

    void deleteByTitle(String title);

    boolean existsByHash(String hash);

}
