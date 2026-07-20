package JMR.Hackathon.BackEnd.Documents.api;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.mapper.DocumentDTOMapper;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Hasher;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

   private final saveKeywords saveKeywords;

    private final NormalizedText  textNormalizer;

    private final Hasher hasher;

    private final DocumentDTOMapper dtoMapper;

    private final DocumentKeywordRepository  documentKeywordRepository;

    private final KeywordRepository keywordRepository;

    @Transactional
   public DocumentResponse create(DocumentRequest request) {

        String textToHash = request.title() + " " + request.content();

        String normalized = textNormalizer.normalize(textToHash);

        String hash = hasher.sha256(normalized);

        if (documentRepository.existsByHash(hash)) {

            Document d = documentRepository.FindByHash(hash)
                    .orElseThrow();


            return dtoMapper.ToResponse(d);


        }else{

            Document d = dtoMapper.ToDomain(request);
            d.setHash(hash);

            Document s = documentRepository.save(d)
                    .orElseThrow();


            saveKeywords.save(s,request.keyword());




            return dtoMapper.ToResponse(s);



        }

   }

   public List<DocumentResponse> getAllDocuments() {

       return documentRepository.findAll()
               .stream()
               .map(dtoMapper::ToResponse)
               .toList();


   }

    public DocumentResponse getDocumentById(Long id) {

       return documentRepository.FindById(id).map(dtoMapper::ToResponse).orElseThrow();

    }

    public DocumentResponse getDocumentsByTitle(String t){

       return documentRepository.FindByTitle(t).map(dtoMapper::ToResponse).orElseThrow();

    }

    @Transactional
    public void deleteDocumentById(Long id) {




       documentRepository.delete(id);

    }

    @Transactional
    public void deleteDocumentByTitle(String title) {

       documentRepository.deleteByTitle(title);

    }


    public List<DocumentResponse> getDocumentByKeyword(String keyword) {

        Keyword k = keywordRepository.FindByKeyword(keyword)
                .orElseThrow();
        List<Long> dID = documentKeywordRepository.findDocumentIdsByKeywordId(k.getId());

        List<DocumentResponse> responses = new ArrayList<>();

        for (Long id : dID) {

            Document find = documentRepository.FindById(id)
                    .orElseThrow();

            responses.add(dtoMapper.ToResponse(find));

        }

        return responses;

    }
}
