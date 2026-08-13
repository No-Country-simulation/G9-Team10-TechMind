package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

/**
 * Contrato de ENTRADA hacia POST /api/v1/search del microservicio FastAPI.
 * Corresponde al schema SearchRequest en Data/5.API_Final/models/schemas.py
 */
@Builder
public record SearchRequest(
        @JsonProperty("query") String query,
        @JsonProperty("top_k") int topK
) {}
