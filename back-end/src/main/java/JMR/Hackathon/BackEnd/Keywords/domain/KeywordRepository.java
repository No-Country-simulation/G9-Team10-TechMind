package JMR.Hackathon.BackEnd.Keywords.domain;

import java.util.List;
import java.util.Optional;

public interface KeywordRepository {

    Optional<Keyword> save(Keyword keyword);

    Optional<Keyword> findById(Long id);

    Optional<Keyword> findByKeyword(String keyword);

    void deleteById(Long id);

    void deleteByKeyword(String keyword);

    List<Keyword> findAll();

    Boolean existsByKeyword(String iKeyword);

    List<Keyword> findAllByDocumentId(Long documentId);

    List<Keyword> findAllById(List<Long> ids);


}
