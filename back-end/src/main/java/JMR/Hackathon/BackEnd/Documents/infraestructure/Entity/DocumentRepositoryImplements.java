package JMR.Hackathon.BackEnd.Documents.infraestructure.Entity;

import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Mapper.DocumentMapper;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@AllArgsConstructor
@Component
public class DocumentRepositoryImplements implements DocumentRepository {

    private final DocumentRepositoryJPA JPA;

    private final DocumentMapper mapper;

    @Override
    public Optional<Document> save(Document document) {

        DocumentEntity documentEntity = mapper.ToEntity(document);

        return JPA.save(documentEntity)
                .map(mapper::ToDomain);

    }

    @Override
    public Optional<Document> FindById(Long id) {

      return JPA.FindById(id)
              .map(mapper::ToDomain);
    }

    @Override
    public Optional<Document> FindByTitle(String title) {

        return JPA.FindByTitle(title)
                .map(mapper::ToDomain);
    }

    @Override
    public void delete(Long id) {

        JPA.deleteById(id);
    }

    @Override
    public void deleteByTitle(String title) {

        JPA.deleteByTitle(title);
    }

    @Override
    public boolean existsByHash(String hash) {

        return JPA.existsByhash(hash);
    }
}
