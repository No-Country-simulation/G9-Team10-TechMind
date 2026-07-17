package JMR.Hackathon.BackEnd.Keywords.domain;

import java.util.Optional;

public interface KeywordRepository {

    Keyword save(Keyword keyword);

    Optional<Keyword> FindById(Long id);

    Optional<Keyword> FindByKeyword(String keyword);

    void delete(Long id);

    void deleteByKeyword(String keyword);

}
