package JMR.Hackathon.BackEnd.DocumentKeyword.infraestructure;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeyword;
import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Repository
public class DocumentKeywordRepositoryImpl implements DocumentKeywordRepository {

    private final DocumentKeywordRepositoryJPA jpaRepository;

    private final DocumentKeywordMapper mapper;

    @Override
    public Optional<DocumentKeyword> save(DocumentKeyword documentKeyword) {

       DocumentKeywordEntity e = mapper.ToEntity(documentKeyword);

       DocumentKeywordEntity saved = jpaRepository.save(e);

        return Optional.of(mapper.ToDomain(e));
    }



    @Override
    public List<Long> findKeywordIdsByDocumentId(Long documentId) {


        return jpaRepository.findKeywordIdsByDocumentId(documentId);

    }



    @Override
    public List<Long> findDocumentIdsByKeywordId(Long keywordId) {


        return jpaRepository.findDocumentIdsByKeywordId(keywordId);
    }
}
