package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;

import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Mapper.DocumentMapper;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Repository
public class DocumentRepositoryImplements implements DocumentRepository {

    private final DocumentRepositoryJPA jpaRepository;

    private final DocumentMapper mapper;

    @Override
    public Optional<Document> save(Document document) {

        DocumentEntity documentEntity = mapper.ToEntity(document);

        return jpaRepository.save(documentEntity)
                .map(mapper::ToDomain);

    }

    @Override
    public Optional<Document> FindById(Long id) {

      return jpaRepository.FindById(id)
              .map(mapper::ToDomain);
    }

    @Override
    public Optional<Document> FindByTitle(String title) {

        return jpaRepository.FindByTitle(title)
                .map(mapper::ToDomain);
    }

    @Override
    public Optional<Document> FindByHash(String hash) {

        return jpaRepository.FindByHash(hash).map(mapper::ToDomain);
    }

    @Override
    public void delete(Long id) {

        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByTitle(String title) {

        jpaRepository.deleteByTitle(title);
    }

    @Override
    public boolean existsByHash(String hash) {

        return jpaRepository.existsByhash(hash);
    }

    @Override
    public List<Document> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::ToDomain)
                .toList();
    }
}
