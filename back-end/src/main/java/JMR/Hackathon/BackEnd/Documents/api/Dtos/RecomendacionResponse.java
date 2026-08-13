package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Contrato de SALIDA de POST /api/v1/search y POST /api/v1/recommend del microservicio FastAPI.
 * Corresponde al schema RecomendacionResponse en Data/5.API_Final/models/schemas.py
 */
public record RecomendacionResponse(
        @JsonProperty("resultados") List<DocumentoSimilitud> resultados,
        @JsonProperty("trace_id")   String traceId
) {}
