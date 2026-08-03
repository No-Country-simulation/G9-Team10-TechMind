package JMR.Hackathon.BackEnd.Documents.InfrastructureTest;

import JMR.Hackathon.BackEnd.Documents.infraestructure.NormalizedText;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NormalizedTextTest {

    private NormalizedText normalizer;

    @BeforeEach
    void setUp() {
        normalizer = new NormalizedText();
    }

    // ─────────────────────────────────────────────
    // Casos null y vacíos
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("null → retorna string vacío")
    void shouldReturnEmpty_whenInputIsNull() {
        assertEquals("", normalizer.normalize(null));
    }

    @Test
    @DisplayName("string vacío → retorna string vacío")
    void shouldReturnEmpty_whenInputIsEmpty() {
        assertEquals("", normalizer.normalize(""));
    }

    @Test
    @DisplayName("solo espacios en blanco → retorna string vacío")
    void shouldReturnEmpty_whenInputIsBlank() {
        assertEquals("", normalizer.normalize("   "));
    }

    // ─────────────────────────────────────────────
    // Conversión a minúsculas
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("texto en mayúsculas → convierte a minúsculas")
    void shouldLowercase_whenInputHasUppercase() {
        assertEquals("inteligencia artificial", normalizer.normalize("INTELIGENCIA ARTIFICIAL"));
    }

    @Test
    @DisplayName("texto mixto → convierte a minúsculas")
    void shouldLowercase_whenInputIsMixedCase() {
        assertEquals("redes neuronales", normalizer.normalize("Redes Neuronales"));
    }

    // ─────────────────────────────────────────────
    // Eliminación de acentos
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("texto con acentos → elimina los acentos")
    void shouldRemoveAccents_whenInputHasAccents() {
        assertEquals("programacion", normalizer.normalize("Programación"));
    }

    @Test
    @DisplayName("texto con múltiples acentos → elimina todos")
    void shouldRemoveAllAccents_whenInputHasMultipleAccents() {
        assertEquals("algoritmos de clasificacion", normalizer.normalize("Algoritmos de Clasificación"));
    }

    @Test
    @DisplayName("texto con ü, ö, ñ → elimina diacríticos")
    void shouldRemoveDiacritics_whenInputHasSpecialChars() {
        assertEquals("educacion tecnica", normalizer.normalize("Educación Técnica"));
    }

    // ─────────────────────────────────────────────
    // Eliminación de puntuación
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("texto con comas y puntos → elimina puntuación")
    void shouldRemovePunctuation_whenInputHasCommasAndDots() {
        assertEquals("red neuronal", normalizer.normalize("red, neuronal."));
    }

    @Test
    @DisplayName("texto con signos de interrogación → elimina puntuación")
    void shouldRemovePunctuation_whenInputHasQuestionMarks() {
        assertEquals("que es java", normalizer.normalize("¿Qué es Java?"));
    }

    @Test
    @DisplayName("texto con guiones → el guión se elimina sin insertar espacio")
    void shouldRemovePunctuation_whenInputHasHyphens() {
        // El guión es puntuación (\p{P}), se elimina directamente sin reemplazar por espacio.
        // "aprendizaje-automatico" → "aprendizajeautomatico"
        assertEquals("aprendizajeautomatico", normalizer.normalize("aprendizaje-automático"));
    }

    // ─────────────────────────────────────────────
    // Normalización de espacios
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("múltiples espacios internos → colapsa a uno")
    void shouldCollapseSpaces_whenInputHasMultipleSpaces() {
        assertEquals("java spring boot", normalizer.normalize("java   spring   boot"));
    }

    @Test
    @DisplayName("espacios al inicio y al final → los elimina")
    void shouldTrim_whenInputHasLeadingAndTrailingSpaces() {
        assertEquals("docker", normalizer.normalize("  docker  "));
    }

    @Test
    @DisplayName("tab entre palabras → se elimina como carácter de control, sin insertar espacio")
    void shouldRemoveControlChars_whenInputHasTab() {
        // El tab es un carácter de control (\p{Cntrl}), se elimina antes de colapsar espacios.
        // "machine\tlearning" → "machinelearning"
        assertEquals("machinelearning", normalizer.normalize("machine\tlearning"));
    }

    // ─────────────────────────────────────────────
    // Caso completo
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("texto con acentos, puntuación, mayúsculas y espacios extra → resultado limpio")
    void shouldFullyNormalize_whenInputHasAllIssues() {
        assertEquals("introduccion a la programacion orientada a objetos",
                normalizer.normalize("  ¡Introducción  a la Programación,  Orientada a Objetos!  "));
    }

    @Test
    @DisplayName("texto ya normalizado → no cambia")
    void shouldReturnSame_whenInputIsAlreadyNormalized() {
        assertEquals("java", normalizer.normalize("java"));
    }
}
