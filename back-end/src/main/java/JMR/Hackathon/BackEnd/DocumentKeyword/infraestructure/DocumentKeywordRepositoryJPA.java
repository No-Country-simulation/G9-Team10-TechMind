package JMR.Hackathon.BackEnd.DocumentKeyword.infraestructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DocumentKeywordRepositoryJPA extends JpaRepository<DocumentKeywordEntity,Long> {


    List<DocumentKeywordEntity> findByDocumentId(Long documentId);


    @Query("""
        SELECT dk.keywordId
        FROM DocumentKeywordEntity dk
        WHERE dk.documentId = :documentId
        """)
    List<Long> findKeywordIdsByDocumentId(Long documentId);

    @Query("""
        SELECT dk.documentId
        FROM DocumentKeywordEntity dk
        WHERE dk.keywordId = :keywordId
        """)
    List<Long> findDocumentIdsByKeywordId(Long keywordId);

}
