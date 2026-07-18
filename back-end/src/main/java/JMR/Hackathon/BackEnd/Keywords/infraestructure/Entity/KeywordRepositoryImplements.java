package JMR.Hackathon.BackEnd.Keywords.infraestructure.Entity;


import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import JMR.Hackathon.BackEnd.Keywords.infraestructure.mapper.KeywordMapper;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class KeywordRepositoryImplements implements KeywordRepository {

    private final KeywordRepositoryJPA jpaRepository;

    private final KeywordMapper mapper;


    @Override
    public Optional<Keyword> save(Keyword keyword) {

        KeywordEntity e =  mapper.ToEntity(keyword);

        return jpaRepository.save(e)
                .map(mapper::ToDomain);

    }

    @Override
    public Optional<Keyword> FindById(Long id) {


        return jpaRepository.FindById(id)
                .map(mapper::ToDomain);
    }

    @Override
    public Optional<Keyword> FindByKeyword(String keyword) {

        return jpaRepository.FindByKeyword(keyword)
                .map(mapper::ToDomain);

    }


    @Override
    public void deleteById(Long id) {

        jpaRepository.deleteById(id);

    }

    @Override
    public void deleteByKeyword(String keyword) {

        jpaRepository.deleteByKeyword(keyword);

    }

    @Override
    public List<Keyword> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::ToDomain)
                .toList();
    }


    @Override
    public List<Long> findAllDocumentIds() {

        return jpaRepository.findAllDocumentIds();

    }
}
