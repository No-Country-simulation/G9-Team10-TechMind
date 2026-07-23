package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

/**
 * Contrato de ENTRADA hacia el microservicio FastAPI de Python.
 * Corresponde al schema TextoInput en Data/5.API_Final/models/schemas.py
 */
@Builder
public record AiAnalysisRequest(
        @JsonProperty("titulo") String titulo,
        @JsonProperty("texto")  String texto
) {}
