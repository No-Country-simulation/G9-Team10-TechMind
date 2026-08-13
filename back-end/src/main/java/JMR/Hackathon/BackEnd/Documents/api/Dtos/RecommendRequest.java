package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

/**
 * Contrato de ENTRADA hacia POST /api/v1/recommend del microservicio FastAPI.
 * Corresponde al schema RecommendRequest en Data/5.API_Final/models/schemas.py
 */
@Builder
public record RecommendRequest(
        @JsonProperty("doc_id") String docId,
        @JsonProperty("top_k")  int topK
) {}
