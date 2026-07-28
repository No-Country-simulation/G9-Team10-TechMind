package JMR.Hackathon.BackEnd.Keywords.infraestructure.Entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;
import java.util.Optional;

public interface KeywordRepositoryJPA extends JpaRepository<KeywordEntity, Long> {


    Optional<KeywordEntity> findById(Long id);

    Optional<KeywordEntity> findByKeyword(String keyword);


    void deleteByKeyword(String keyword);

    List<KeywordEntity> findAll();

    Boolean existsByKeyword(String keyword);


    @Query("""
        SELECT k
        FROM KeywordEntity k
        JOIN DocumentKeywordEntity dk
            ON k.id = dk.keywordId
        WHERE dk.documentId = :documentId
    """)
    List<KeywordEntity> findAllByDocumentId(Long documentId);
}
