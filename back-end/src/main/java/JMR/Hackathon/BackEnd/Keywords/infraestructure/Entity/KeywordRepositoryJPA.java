package JMR.Hackathon.BackEnd.Keywords.infraestructure.Entity;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface KeywordRepositoryJPA extends CrudRepository<KeywordEntity, Long> {


    Optional<KeywordEntity> findById(Long id);

    Optional<KeywordEntity> findByKeyword(String keyword);


    void deleteByKeyword(String keyword);

    List<KeywordEntity> findAll();

    Boolean existsByKeyword(String keyword);

}
