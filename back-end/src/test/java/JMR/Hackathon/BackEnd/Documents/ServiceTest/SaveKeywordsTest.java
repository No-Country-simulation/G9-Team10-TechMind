package JMR.Hackathon.BackEnd.Documents.ServiceTest;

import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeyword;
import JMR.Hackathon.BackEnd.DocumentKeyword.domain.DocumentKeywordRepository;
import JMR.Hackathon.BackEnd.Documents.domain.Service.saveKeywords;
import JMR.Hackathon.BackEnd.Documents.domain.Document;
import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import JMR.Hackathon.BackEnd.Keywords.domain.Keyword;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaveKeywordsTest {

    @Mock private KeywordRepository keywordRepository;
    @Mock private DocumentKeywordRepository documentKeywordRepository;
    @Mock private NormalizedText normalizer;

    @InjectMocks
    private saveKeywords saveKeywords;

    private Document buildDocument(Long id) {
        return Document.builder().id(id).build();
    }

    // ─────────────────────────────────────────────
    // Escenario 1 — Todas las keywords son nuevas
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("save() con keywords nuevas → persiste cada keyword y crea DocumentKeyword por cada una")
    void shouldSaveNewKeywords_whenNoneExistInDB() {
        Document doc = buildDocument(1L);
        Keyword savedKw1 = new Keyword(10L, "java");
        Keyword savedKw2 = new Keyword(11L, "spring");

        when(keywordRepository.findAll()).thenReturn(Collections.emptyList());
        when(normalizer.normalize("Java")).thenReturn("java");
        when(normalizer.normalize("Spring")).thenReturn("spring");
        when(keywordRepository.save(any(Keyword.class))).thenAnswer(inv -> {
            Keyword k = inv.getArgument(0);
            return "java".equals(k.getKeyword()) ? Optional.of(savedKw1) : Optional.of(savedKw2);
        });

        saveKeywords.save(doc, List.of("Java", "Spring"));

        // Debe haber persistido 2 keywords nuevas
        verify(keywordRepository, times(2)).save(any(Keyword.class));

        // Debe haber guardado 2 DocumentKeywords
        ArgumentCaptor<List<DocumentKeyword>> captor = ArgumentCaptor.forClass(List.class);
        verify(documentKeywordRepository).saveAll(captor.capture());

        List<DocumentKeyword> saved = captor.getValue();
        assertEquals(2, saved.size());
        assertEquals(1L,  saved.get(0).getDocumentId());
        assertEquals(10L, saved.get(0).getKeywordId());
        assertEquals(1L,  saved.get(1).getDocumentId());
        assertEquals(11L, saved.get(1).getKeywordId());
    }

    // ─────────────────────────────────────────────
    // Escenario 2 — Todas las keywords ya existen
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("save() con keywords ya existentes → reutiliza entidades sin llamar a keywordRepository.save()")
    void shouldReuseExistingKeywords_whenAllExistInDB() {
        Document doc = buildDocument(2L);
        Keyword existingKw = new Keyword(20L, "docker");

        when(keywordRepository.findAll()).thenReturn(List.of(existingKw));
        when(normalizer.normalize("docker")).thenReturn("docker");

        saveKeywords.save(doc, List.of("docker"));

        // No debe persistir keyword nueva
        verify(keywordRepository, never()).save(any(Keyword.class));

        // Sí debe guardar el DocumentKeyword con la keyword existente
        ArgumentCaptor<List<DocumentKeyword>> captor = ArgumentCaptor.forClass(List.class);
        verify(documentKeywordRepository).saveAll(captor.capture());

        List<DocumentKeyword> saved = captor.getValue();
        assertEquals(1, saved.size());
        assertEquals(2L,  saved.get(0).getDocumentId());
        assertEquals(20L, saved.get(0).getKeywordId());
    }

    // ─────────────────────────────────────────────
    // Escenario 3 — Lista mixta (algunas nuevas, algunas existentes)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("save() con lista mixta → persiste solo las keywords nuevas y reutiliza las existentes")
    void shouldHandleMixedKeywords_whenSomeExistAndSomeAreNew() {
        Document doc = buildDocument(3L);
        Keyword existingKw = new Keyword(30L, "kubernetes");
        Keyword savedNewKw  = new Keyword(31L, "helm");

        when(keywordRepository.findAll()).thenReturn(List.of(existingKw));
        when(normalizer.normalize("kubernetes")).thenReturn("kubernetes");
        when(normalizer.normalize("Helm")).thenReturn("helm");
        when(keywordRepository.save(argThat(k -> "helm".equals(k.getKeyword()))))
                .thenReturn(Optional.of(savedNewKw));

        saveKeywords.save(doc, List.of("kubernetes", "Helm"));

        // Solo debe persistir la keyword nueva ("helm")
        verify(keywordRepository, times(1)).save(any(Keyword.class));

        ArgumentCaptor<List<DocumentKeyword>> captor = ArgumentCaptor.forClass(List.class);
        verify(documentKeywordRepository).saveAll(captor.capture());

        List<DocumentKeyword> saved = captor.getValue();
        assertEquals(2, saved.size());

        // Primera keyword → la existente (kubernetes, id=30)
        assertEquals(30L, saved.get(0).getKeywordId());
        // Segunda keyword → la nueva (helm, id=31)
        assertEquals(31L, saved.get(1).getKeywordId());
    }

    // ─────────────────────────────────────────────
    // Escenario 4 — Keyword duplicada en la lista de entrada
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("save() con keyword repetida en la lista → la persiste solo la primera vez, reutiliza en la segunda")
    void shouldNotPersistDuplicate_whenSameKeywordAppearsMoreThanOnce() {
        Document doc = buildDocument(4L);
        Keyword savedKw = new Keyword(40L, "python");

        when(keywordRepository.findAll()).thenReturn(Collections.emptyList());
        when(normalizer.normalize("python")).thenReturn("python");
        when(keywordRepository.save(any(Keyword.class))).thenReturn(Optional.of(savedKw));

        saveKeywords.save(doc, List.of("python", "python"));

        // Debe persistir la keyword solo la primera vez (la segunda ya está en el mapa)
        verify(keywordRepository, times(1)).save(any(Keyword.class));

        // Pero sí debe crear 2 DocumentKeywords (una por cada entrada de la lista)
        ArgumentCaptor<List<DocumentKeyword>> captor = ArgumentCaptor.forClass(List.class);
        verify(documentKeywordRepository).saveAll(captor.capture());
        assertEquals(2, captor.getValue().size());
    }

    // ─────────────────────────────────────────────
    // Escenario 5 — Fallo al persistir keyword nueva
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("save() cuando keywordRepository.save() retorna empty → lanza IllegalStateException")
    void shouldThrowIllegalState_whenKeywordCannotBePersisted() {
        Document doc = buildDocument(5L);

        when(keywordRepository.findAll()).thenReturn(Collections.emptyList());
        when(normalizer.normalize("rust")).thenReturn("rust");
        when(keywordRepository.save(any(Keyword.class))).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class,
                () -> saveKeywords.save(doc, List.of("rust")));

        // No debe guardar DocumentKeywords si falló la keyword
        verify(documentKeywordRepository, never()).saveAll(any());
    }

    // ─────────────────────────────────────────────
    // Escenario 6 — La normalización se aplica antes de buscar en el mapa
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("save() con keyword en mayúsculas → normaliza antes de buscar en DB y no crea duplicado")
    void shouldNormalizeBeforeLookup_whenKeywordHasUppercase() {
        Document doc = buildDocument(6L);
        // DB ya tiene "java" en minúscula
        Keyword existingKw = new Keyword(50L, "java");

        when(keywordRepository.findAll()).thenReturn(List.of(existingKw));
        // El normalizer convierte "JAVA" → "java"
        when(normalizer.normalize("JAVA")).thenReturn("java");

        saveKeywords.save(doc, List.of("JAVA"));

        // No debe crear keyword nueva porque "java" ya existe tras normalizar
        verify(keywordRepository, never()).save(any(Keyword.class));

        ArgumentCaptor<List<DocumentKeyword>> captor = ArgumentCaptor.forClass(List.class);
        verify(documentKeywordRepository).saveAll(captor.capture());

        assertEquals(1, captor.getValue().size());
        assertEquals(50L, captor.getValue().get(0).getKeywordId());
    }

    // ─────────────────────────────────────────────
    // Escenario 7 — Lista vacía
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("save() con lista vacía → no persiste nada, llama saveAll con lista vacía")
    void shouldSaveEmptyList_whenKeywordsIsEmpty() {
        Document doc = buildDocument(7L);

        when(keywordRepository.findAll()).thenReturn(Collections.emptyList());

        saveKeywords.save(doc, Collections.emptyList());

        verify(keywordRepository, never()).save(any(Keyword.class));
        verify(normalizer, never()).normalize(any());

        ArgumentCaptor<List<DocumentKeyword>> captor = ArgumentCaptor.forClass(List.class);
        verify(documentKeywordRepository).saveAll(captor.capture());
        assertTrue(captor.getValue().isEmpty());
    }
}
