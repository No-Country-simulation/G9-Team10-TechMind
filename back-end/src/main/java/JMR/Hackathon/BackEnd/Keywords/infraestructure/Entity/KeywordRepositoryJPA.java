package JMR.Hackathon.BackEnd.Keywords.infraestructure.Entity;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface KeywordRepositoryJPA extends CrudRepository<KeywordEntity, Long> {

    Optional<KeywordEntity> save(KeywordEntity keywordEntity);

    Optional<KeywordEntity> FindById(Long id);

    Optional<KeywordEntity> FindByKeyword(String keyword);


    void deleteByKeyword(String keyword);

    List<KeywordEntity> findAll();

    List<Long> findAllDocumentIds();
}
