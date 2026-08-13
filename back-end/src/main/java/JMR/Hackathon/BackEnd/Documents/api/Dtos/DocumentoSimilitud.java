package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Representa un documento similar dentro de la respuesta de búsqueda/recomendación.
 * Corresponde al schema DocumentoSimilitud en Data/5.API_Final/models/schemas.py
 */
public record DocumentoSimilitud(
        @JsonProperty("doc_id")           String docId,
        @JsonProperty("title")            String title,
        @JsonProperty("source_type")      String sourceType,
        @JsonProperty("similarity_score") Float  similarityScore,
        @JsonProperty("preview")          String preview
) {}
