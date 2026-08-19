package JMR.Hackathon.BackEnd.Documents.domain.Service;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeyword;
import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
@Transactional
public class saveKeywords {

    private final KeywordRepository keywordRepository;

    private final DocumentKeywordRepository documentKeywordRepository;

    private final NormalizedText normalizer;


    public void save(Document s, List<String> keywords){

        List<Keyword> allKeywords = keywordRepository.findAll();

        Map<String, Keyword> keywordMap = allKeywords.stream()
                .collect(Collectors.toMap(
                        Keyword::getKeyword,
                        Function.identity()
                ));

        List<DocumentKeyword> documentKeywords = new ArrayList<>();


        for (String keyword : keywords) {

            String normalizedKeyword = normalizer.normalize(keyword);

            Keyword keywordEntity = keywordMap.get(normalizedKeyword);

            if (keywordEntity == null) {
                Keyword newKeyword = new Keyword();
                newKeyword.setKeyword(normalizedKeyword);

                keywordEntity = keywordRepository.save(newKeyword)
                        .orElseThrow(() -> new IllegalStateException("error al guardar la keyword."));

                keywordMap.put(normalizedKeyword, keywordEntity);
            }

            DocumentKeyword documentKeyword = new DocumentKeyword();
            documentKeyword.setDocumentId(s.getId());
            documentKeyword.setKeywordId(keywordEntity.getId());

            documentKeywords.add(documentKeyword);

        }
        documentKeywordRepository.saveAll(documentKeywords);

    }

}
