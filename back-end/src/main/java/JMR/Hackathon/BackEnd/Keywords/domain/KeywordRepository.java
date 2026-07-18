package JMR.Hackathon.BackEnd.Keywords.domain;

import java.util.List;
import java.util.Optional;

public interface KeywordRepository {

    Optional<Keyword> save(Keyword keyword);

    Optional<Keyword> FindById(Long id);

    Optional<Keyword> FindByKeyword(String keyword);

    void deleteById(Long id);

    void deleteByKeyword(String keyword);

    List<Keyword> findAll();

    List<Long> findAllDocumentIds();

}
