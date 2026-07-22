package JMR.Hackathon.BackEnd.Documents.api.Dtos;


import JMR.Hackathon.BackEnd.Documents.domain.Nivel;
import lombok.Builder;

import java.util.List;

@Builder
public record DocumentRequest(
        String title,
        String content,
        Float version,
        Nivel Nivel,
        List<String> keyword
) {
}
