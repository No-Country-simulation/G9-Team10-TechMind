package JMR.Hackathon.BackEnd.DocumentKeywordRepository.infraestructure;


import JMR.Hackathon.BackEnd.DocumentKeywordRepository.domain.DocumentKeyword;
import JMR.Hackathon.BackEnd.DocumentKeywordRepository.domain.DocumentKeywordRepository;
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

        return jpaRepository.save(e).map(mapper::ToDomain);
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
