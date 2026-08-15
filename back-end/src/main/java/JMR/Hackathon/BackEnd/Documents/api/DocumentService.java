package JMR.Hackathon.BackEnd.Documents.api;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeyword;
import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.*;
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

import javax.print.Doc;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

        // 2. verificar si no existe en db mediante DocId

        Optional <Document> Doc = documentRepository.findByDocId(aiResult.docId());

        if (Doc.isPresent()) {

            Document document = Doc.get();


            List<String> keywords = keywordRepository.findAllByDocumentId(document.getId())
                    .stream()
                    .map(Keyword::getKeyword)
                    .toList();

            return dtoMapper.ToResponseWithKeywords(document, keywords);
        }




        System.out.println("Lista desde create document: "+ aiResult.keywords());

        // 3. Construir el dominio con los datos enriquecidos por la IA
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

        // 4. Persistir el documento
        Document saved = documentRepository.save(document)
                .orElseThrow(() -> new IllegalStateException("error al guardar el documento."));

        // 5. Persistir las keywords extraídas por la IA
        if (aiResult.keywords() != null && !aiResult.keywords().isEmpty()) {
            saveKeywords.save(saved, aiResult.keywords());
        }

        // 6. Retornar la respuesta enriquecida con las keywords

        return dtoMapper.ToResponseWithKeywords(saved, aiResult.keywords());
    }

   public List<DocumentResponse> getAllDocuments() {

       return documentRepository.findAll()
               .stream()
               .map(dtoMapper::ToResponse)
               .toList();


   }

    public DocumentResponse getDocumentById(Long id) {
        Document d = documentRepository.FindById(id)
                    .orElseThrow(()->new DocumentNotFoundException(id));

        List<String> keywords = keywordRepository.findAllByDocumentId(d.getId())
                .stream()
                .map(Keyword::getKeyword)
                .toList();

        return dtoMapper.ToResponseWithKeywords(d, keywords);

    }

    public DocumentResponse getDocumentByTitle(String t){

        Document d = documentRepository.FindByTitle(t)
               .orElseThrow(()->new DocumentNotFoundException(t));

        List<String> keywords = keywordRepository.findAllByDocumentId(d.getId())
                .stream()
                .map(Keyword::getKeyword)
                .toList();

        return dtoMapper.ToResponseWithKeywords(d, keywords);

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

        System.out.println("keyword: "+keyword);

        Keyword k = keywordRepository.findByKeyword(keyword)
                .orElseThrow(() -> new KeywordNotFoundException(keyword));

        List<Long> dID = documentKeywordRepository.findDocumentIdsByKeywordId(k.getId());

        System.out.println("Lista de ids" + dID);

        List<DocumentResponse> responses = documentRepository.findAllById(dID)
                .stream()
                .map(dtoMapper::ToResponse)
                .toList();

        return responses;

    }


    public List<DocumentResponse> recommend(String docId, int topK) {

        RecomendacionResponse response = aiClient.recommend(docId, topK);

        List<DocumentoSimilitud> similitudes = response.resultados();

        System.out.println("SIMILITUDES:" + similitudes);

        List<String> docIds = new ArrayList<>();

        for(DocumentoSimilitud sim : similitudes) {

            docIds.add(sim.docId());

        }

        List<DocumentResponse> responseList = documentRepository.findByByDocIdIn(docIds)
                .stream()
                .map(dtoMapper::ToResponse)
                .toList();

        System.out.println("RESPONSE: "+ responseList);

        return responseList;

    }


    public List<DocumentResponse> search(String query, int topK) {

        RecomendacionResponse response = aiClient.search(query, topK);

        List<DocumentoSimilitud> similitudes = response.resultados();

        List<String> docIds = new ArrayList<>();

        for(DocumentoSimilitud sim : similitudes) {

            docIds.add(sim.docId());

        }

        List<DocumentResponse> responseList = documentRepository.findByByDocIdIn(docIds)
                .stream()
                .map(dtoMapper::ToResponse)
                .toList();

        return responseList;

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
