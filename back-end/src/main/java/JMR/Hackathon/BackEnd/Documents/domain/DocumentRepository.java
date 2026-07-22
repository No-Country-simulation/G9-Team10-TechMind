package JMR.Hackathon.BackEnd.Documents.domain;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository {

    Optional<Document> save(Document document); // endpoint

    Optional<Document> FindById(Long id); //endpoint

    Optional<Document> FindByTitle(String title); //endpoint
    // no endpoint

    void delete(Long id); //endpoint

    void deleteByTitle(String title);

    List<Document> findAll(); //endpoint

}
