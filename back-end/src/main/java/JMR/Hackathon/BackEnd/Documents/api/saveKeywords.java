package JMR.Hackathon.BackEnd.Documents.api;


import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeyword;
import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;

@Component
@AllArgsConstructor
public class saveKeywords {

    private final KeywordRepository keywordRepository;

    private final DocumentKeywordRepository documentKeywordRepository;

    private final NormalizedText normalizer;


    public void save(Document s, List<String> keywords){

        for (String keyword : keywords) {

            String normalizedKeyword = normalizer.normalize(keyword);

            Keyword a = new Keyword();
            a.setKeyword(normalizedKeyword);

            Keyword keywordEntity = keywordRepository.FindByKeyword(normalizedKeyword)
                    .orElseGet(() -> {
                        Keyword k = new Keyword();
                        k.setKeyword(normalizedKeyword);
                        return keywordRepository.save(k).orElseThrow();
                    });

            DocumentKeyword documentKeyword = new DocumentKeyword();
            documentKeyword.setDocumentId(s.getId());
            documentKeyword.setKeywordId(keywordEntity.getId());

            documentKeywordRepository.save(documentKeyword);



        }

    }

}
