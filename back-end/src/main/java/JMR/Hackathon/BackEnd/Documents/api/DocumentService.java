package JMR.Hackathon.BackEnd.Documents.api;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisResponse;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.mapper.DocumentDTOMapper;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Nivel;
import JMR.Hackathon.BackEnd.Documents.domain.exception.DocumentNotFoundException;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Hasher;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import JMR.Hackathon.BackEnd.Keywords.domain.exception.KeywordNotFoundException;
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

    private final NormalizedText textNormalizer;

    private final Hasher hasher;

    private final DocumentDTOMapper dtoMapper;

    private final DocumentKeywordRepository documentKeywordRepository;

    private final KeywordRepository keywordRepository;

    private final AiClient aiClient;

    @Transactional
    public DocumentResponse create(DocumentRequest request) {

        // 1. Llamar al microservicio Python para analizar el texto
        AiAnalysisResponse aiResult = aiClient.analyze(request.title(), request.content());

        // 2. Construir el dominio con los datos enriquecidos por la IA
        Document document = Document.builder()
                .docID(aiResult.docId())
                .trace_id(aiResult.traceId())
                .title(aiResult.titulo())
                .content(aiResult.texto())
                .Categoria(aiResult.categoria())
                .probabilidadCategoria(aiResult.probabilidadCategoria())
                .version(Float.parseFloat(aiResult.version()))
                .nivel(parseNivel(aiResult.nivel()))
                .build();

        // 3. Persistir el documento
        Document saved = documentRepository.save(document)
                .orElseThrow(() -> new IllegalStateException("error al guardar el documento."));

        // 4. Persistir las keywords extraídas por la IA
        if (aiResult.keywords() != null && !aiResult.keywords().isEmpty()) {
            saveKeywords.save(saved, aiResult.keywords());
        }

        // 5. Retornar la respuesta enriquecida con las keywords
        return dtoMapper.ToResponseWithKeywords(saved, aiResult.keywords());
    }

   public List<DocumentResponse> getAllDocuments() {

       return documentRepository.findAll()
               .stream()
               .map(dtoMapper::ToResponse)
               .toList();


   }

    public DocumentResponse getDocumentById(Long id) {

       return documentRepository.FindById(id).map(dtoMapper::ToResponse)
               .orElseThrow(()->new DocumentNotFoundException(id));

    }

    public DocumentResponse getDocumentByTitle(String t){

       return documentRepository.FindByTitle(t).map(dtoMapper::ToResponse)
               .orElseThrow(()->new DocumentNotFoundException(t));

    }

    @Transactional
    public void deleteDocumentById(Long id) {

        documentRepository.FindById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

       documentRepository.delete(id);

    }

    @Transactional
    public void deleteDocumentByTitle(String title) {

        documentRepository.FindByTitle(title)
                .orElseThrow(() -> new DocumentNotFoundException(title));

       documentRepository.deleteByTitle(title);

    }


    public List<DocumentResponse> getDocumentByKeyword(String keyword) {

        Keyword k = keywordRepository.findByKeyword(keyword)
                .orElseThrow(() -> new KeywordNotFoundException(keyword));

        List<Long> dID = documentKeywordRepository.findDocumentIdsByKeywordId(k.getId());

        List<DocumentResponse> responses = new ArrayList<>();

        for (Long id : dID) {

            Document find = documentRepository.FindById(id)
                    .orElseThrow(()->new DocumentNotFoundException(id));

            responses.add(dtoMapper.ToResponse(find));

        }

        return responses;

    }

    //  Convierte el string de nivel que viene de Python al enum Nivel.
     
    private Nivel parseNivel(String nivelStr) {
        if (nivelStr == null) return Nivel.Intermedio;
        for (Nivel n : Nivel.values()) {
            if (n.name().equalsIgnoreCase(nivelStr.trim())) {
                return n;
            }
        }
        return Nivel.Intermedio; // fallback seguro
    }
}
