package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import java.util.List;


public record DocumentResponse(
        String title,
        String content,
        String categoria,
        Float  probabilidadCategoria,
        String nivel,
        List<String> keywords
) {}
