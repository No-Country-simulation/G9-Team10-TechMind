package JMR.Hackathon.BackEnd.Documents.api;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.mapper.DocumentDTOMapper;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Hasher;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    private final KeywordRepository keywordRepository;

    private final DocumentKeywordRepository documentKeywordRepository;

    private final NormalizedText  textNormalizer;

    private final Hasher hasher;

    private final DocumentDTOMapper dtoMapper;


   public DocumentResponse create(DocumentRequest request) {

        String textToHash = request.title() + " " + request.content();

        String normalized = textNormalizer.normalize(textToHash);

        String hash = Hasher.sha256(normalized);

        if (documentRepository.existsByHash(hash)) {

            Document d = documentRepository.FindByHash(hash)
                    .orElseThrow();


            return dtoMapper.ToResponse(d);


        }else{

            //Llamar a python y registrar nuevo





        }






        return null;
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

    public void deleteDocumentById(Long id) {

       documentRepository.delete(id);

    }

    public void deleteDocumentByTitle(String title) {

       documentRepository.deleteByTitle(title);

    }










}
