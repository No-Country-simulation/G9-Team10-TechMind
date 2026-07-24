package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import lombok.Builder;

import java.util.List;

@Builder
public record DocumentResponse(
        String title,
        String content,
        String categoria,
        Float  probabilidadCategoria,
        String nivel,
        List<String> keywords
) {}
