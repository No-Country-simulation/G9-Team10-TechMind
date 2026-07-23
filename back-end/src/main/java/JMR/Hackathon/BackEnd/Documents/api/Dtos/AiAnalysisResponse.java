package JMR.Hackathon.BackEnd.Documents.api.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Contrato de SALIDA del microservicio FastAPI de Python.
 * Corresponde al schema AnalisisResponse en Data/5.API_Final/models/schemas.py
 */
public record AiAnalysisResponse(
        @JsonProperty("Titulo")                 String titulo,
        @JsonProperty("Texto")                  String texto,
        @JsonProperty("Categoria")              String categoria,
        @JsonProperty("probabilidadCategoria")  Float probabilidadCategoria,
        @JsonProperty("Nivel")                  String nivel,
        @JsonProperty("keywords")               List<String> keywords,
        @JsonProperty("version")                String version,
        @JsonProperty("trace_id")               String traceId,
        @JsonProperty("doc_id")                 String docId
) {}
