package JMR.Hackathon.BackEnd.Documents.domain;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository {

    Optional<Document> save(Document document); // endpoint

    Optional<Document> FindById(Long id); //endpoint

    Optional<Document> FindByTitle(String title); //endpoint

    Boolean existsByDocId(String docID) ;

    void delete(Long id); //endpoint

    void deleteByTitle(String title);

    List<Document> findAll();

    Optional<Document> findByDocId(String docId);

    List<Document> findAllById(List<Long> ids);

    List<Document> findByByDocIdIn(List<String> docId);



}
