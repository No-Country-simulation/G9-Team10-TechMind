package JMR.Hackathon.BackEnd.DocumentKeyword.domain;

import java.util.List;
import java.util.Optional;

public interface DocumentKeywordRepository {

    Optional<DocumentKeyword> save(DocumentKeyword documentKeyword);

    List<Long> findKeywordIdsByDocumentId(Long documentId);

    List<Long> findDocumentIdsByKeywordId(Long keywordId);

}
