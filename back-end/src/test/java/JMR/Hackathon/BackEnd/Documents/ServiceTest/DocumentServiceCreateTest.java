package JMR.Hackathon.BackEnd.Documents.ServiceTest;

import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.api.AiClient;
import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.AiAnalysisResponse;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Documents.api.mapper.DocumentDTOMapper;
import JMR.Hackathon.BackEnd.Documents.api.saveKeywords;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.domain.DocumentRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Nivel;
import JMR.Hackathon.BackEnd.Documents.domain.exception.AiServiceException;
import JMR.Hackathon.BackEnd.Documents.infraestructure.Hasher;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceCreateTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private saveKeywords saveKeywords;
    @Mock private NormalizedText textNormalizer;
    @Mock private Hasher hasher;
    @Mock private DocumentDTOMapper dtoMapper;
    @Mock private DocumentKeywordRepository documentKeywordRepository;
    @Mock private KeywordRepository keywordRepository;
    @Mock private AiClient aiClient;

    @InjectMocks
    private DocumentService service;

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private AiAnalysisResponse buildAiResponse(String docId, List<String> keywords) {
        return new AiAnalysisResponse(
                "Redes Neuronales",
                "Una red neuronal es un modelo computacional.",
                "Inteligencia Artificial",
                0.95f,
                "Avanzado",
                keywords,
                "1.0",
                "trace-456",
                docId
        );
    }

    private Document buildSavedDocument() {
        return Document.builder()
                .id(1L)
                .docID("doc-123")
                .trace_id("trace-456")
                .title("Redes Neuronales")
                .content("Una red neuronal es un modelo computacional.")
                .Categoria("Inteligencia Artificial")
                .probabilidadCategoria(0.95f)
                .nivel(Nivel.Avanzado)
                .build();
    }

    private DocumentResponse buildExpectedResponse(List<String> keywords) {
        return new DocumentResponse(
                "doc-123", "trace-456",
                "Redes Neuronales",
                "Una red neuronal es un modelo computacional.",
                "Inteligencia Artificial",
                0.95f, "Avanzado",
                keywords
        );
    }

    // ─────────────────────────────────────────────
    // Escenario 1 — Documento nuevo
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() documento nuevo → llama a aiClient, persiste, guarda keywords y retorna respuesta")
    void shouldCreateDocument_whenDocIdIsNew() {
        AiAnalysisResponse aiResponse = buildAiResponse("doc-123", List.of("red neuronal", "ia"));
        Document saved = buildSavedDocument();
        DocumentResponse expected = buildExpectedResponse(List.of("red neuronal", "ia"));

        when(aiClient.analyze(anyString(), anyString())).thenReturn(aiResponse);
        when(documentRepository.findByDocId("doc-123")).thenReturn(Optional.empty());
        when(documentRepository.save(any())).thenReturn(Optional.of(saved));
        when(dtoMapper.ToResponseWithKeywords(saved, List.of("red neuronal", "ia"))).thenReturn(expected);

        DocumentResponse result = service.create(new DocumentRequest("Redes Neuronales", "Contenido."));

        assertEquals("doc-123", result.docId());
        assertEquals(2, result.keywords().size());

        verify(aiClient).analyze("Redes Neuronales", "Contenido.");
        verify(documentRepository).findByDocId("doc-123");
        verify(documentRepository).save(any());
        verify(saveKeywords).save(saved, List.of("red neuronal", "ia"));
        verify(dtoMapper).ToResponseWithKeywords(saved, List.of("red neuronal", "ia"));
    }

    // ─────────────────────────────────────────────
    // Escenario 2 — Documento duplicado
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() documento duplicado → retorna el existente sin persistir de nuevo")
    void shouldReturnExisting_whenDocIdAlreadyExists() {
        AiAnalysisResponse aiResponse = buildAiResponse("doc-123", List.of("red neuronal"));
        Document existing = buildSavedDocument();
        Keyword kw = new Keyword(1L, "red neuronal");
        DocumentResponse expected = buildExpectedResponse(List.of("red neuronal"));

        when(aiClient.analyze(anyString(), anyString())).thenReturn(aiResponse);
        when(documentRepository.findByDocId("doc-123")).thenReturn(Optional.of(existing));
        when(keywordRepository.findAllByDocumentId(1L)).thenReturn(List.of(kw));
        when(dtoMapper.ToResponseWithKeywords(existing, List.of("red neuronal"))).thenReturn(expected);

        DocumentResponse result = service.create(new DocumentRequest("Redes Neuronales", "Contenido."));

        assertEquals("doc-123", result.docId());

        // No debe persistir ni guardar keywords nuevas
        verify(documentRepository, never()).save(any());
        verify(saveKeywords, never()).save(any(), any());
    }

    // ─────────────────────────────────────────────
    // Escenario 3 — Keywords null en respuesta IA
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() con keywords null en respuesta IA → no llama a saveKeywords")
    void shouldNotSaveKeywords_whenAiReturnsNullKeywords() {
        AiAnalysisResponse aiResponse = buildAiResponse("doc-123", null);
        Document saved = buildSavedDocument();
        DocumentResponse expected = buildExpectedResponse(null);

        when(aiClient.analyze(anyString(), anyString())).thenReturn(aiResponse);
        when(documentRepository.findByDocId("doc-123")).thenReturn(Optional.empty());
        when(documentRepository.save(any())).thenReturn(Optional.of(saved));
        when(dtoMapper.ToResponseWithKeywords(saved, null)).thenReturn(expected);

        service.create(new DocumentRequest("Redes Neuronales", "Contenido."));

        verify(saveKeywords, never()).save(any(), any());
    }

    // ─────────────────────────────────────────────
    // Escenario 4 — Keywords vacías en respuesta IA
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() con keywords vacías en respuesta IA → no llama a saveKeywords")
    void shouldNotSaveKeywords_whenAiReturnsEmptyKeywords() {
        AiAnalysisResponse aiResponse = buildAiResponse("doc-123", List.of());
        Document saved = buildSavedDocument();
        DocumentResponse expected = buildExpectedResponse(List.of());

        when(aiClient.analyze(anyString(), anyString())).thenReturn(aiResponse);
        when(documentRepository.findByDocId("doc-123")).thenReturn(Optional.empty());
        when(documentRepository.save(any())).thenReturn(Optional.of(saved));
        when(dtoMapper.ToResponseWithKeywords(saved, List.of())).thenReturn(expected);

        service.create(new DocumentRequest("Redes Neuronales", "Contenido."));

        verify(saveKeywords, never()).save(any(), any());
    }

    // ─────────────────────────────────────────────
    // Escenario 5 — Fallo al persistir
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() cuando repository.save() retorna empty → lanza IllegalStateException")
    void shouldThrowIllegalState_whenRepositoryCannotSave() {
        AiAnalysisResponse aiResponse = buildAiResponse("doc-123", List.of("ia"));

        when(aiClient.analyze(anyString(), anyString())).thenReturn(aiResponse);
        when(documentRepository.findByDocId("doc-123")).thenReturn(Optional.empty());
        when(documentRepository.save(any())).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class,
                () -> service.create(new DocumentRequest("Redes Neuronales", "Contenido.")));

        verify(saveKeywords, never()).save(any(), any());
    }

    // ─────────────────────────────────────────────
    // Escenario 6 — AiClient lanza excepción
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() cuando aiClient lanza AiServiceException → la excepción sube sin modificar")
    void shouldPropagateException_whenAiClientFails() {
        when(aiClient.analyze(anyString(), anyString()))
                .thenThrow(new AiServiceException("No se pudo conectar al microservicio."));

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> service.create(new DocumentRequest("Redes Neuronales", "Contenido.")));

        assertEquals("No se pudo conectar al microservicio.", ex.getMessage());

        verifyNoInteractions(documentRepository, saveKeywords, dtoMapper);
    }

    // ─────────────────────────────────────────────
    // Escenario 7 — parseNivel con valor desconocido
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() con nivel desconocido en respuesta IA → persiste con fallback Intermedio")
    void shouldFallbackToIntermedio_whenNivelIsUnknown() {
        AiAnalysisResponse aiResponse = new AiAnalysisResponse(
                "Titulo", "Texto", "Categoria", 0.8f,
                "DESCONOCIDO", List.of(), "1.0", "trace-1", "doc-999"
        );
        Document saved = Document.builder().id(1L).docID("doc-999").nivel(Nivel.Intermedio).build();
        DocumentResponse expected = new DocumentResponse("doc-999", "trace-1",
                "Titulo", "Texto", "Categoria", 0.8f, "Intermedio", List.of());

        when(aiClient.analyze(anyString(), anyString())).thenReturn(aiResponse);
        when(documentRepository.findByDocId("doc-999")).thenReturn(Optional.empty());
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> {
            Document d = inv.getArgument(0);
            // Verificar que el nivel guardado es Intermedio (el fallback)
            assertEquals(Nivel.Intermedio, d.getNivel());
            return Optional.of(saved);
        });
        when(dtoMapper.ToResponseWithKeywords(any(), any())).thenReturn(expected);

        DocumentResponse result = service.create(new DocumentRequest("Titulo", "Texto"));

        assertEquals("Intermedio", result.nivel());
    }

    // ─────────────────────────────────────────────
    // Escenario 8 — parseNivel con valor null
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("create() con nivel null en respuesta IA → persiste con fallback Intermedio")
    void shouldFallbackToIntermedio_whenNivelIsNull() {
        AiAnalysisResponse aiResponse = new AiAnalysisResponse(
                "Titulo", "Texto", "Categoria", 0.8f,
                null, List.of(), "1.0", "trace-1", "doc-888"
        );
        Document saved = Document.builder().id(1L).docID("doc-888").nivel(Nivel.Intermedio).build();
        DocumentResponse expected = new DocumentResponse("doc-888", "trace-1",
                "Titulo", "Texto", "Categoria", 0.8f, "Intermedio", List.of());

        when(aiClient.analyze(anyString(), anyString())).thenReturn(aiResponse);
        when(documentRepository.findByDocId("doc-888")).thenReturn(Optional.empty());
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> {
            Document d = inv.getArgument(0);
            assertEquals(Nivel.Intermedio, d.getNivel());
            return Optional.of(saved);
        });
        when(dtoMapper.ToResponseWithKeywords(any(), any())).thenReturn(expected);

        service.create(new DocumentRequest("Titulo", "Texto"));

        verify(documentRepository).save(any());
    }
}
