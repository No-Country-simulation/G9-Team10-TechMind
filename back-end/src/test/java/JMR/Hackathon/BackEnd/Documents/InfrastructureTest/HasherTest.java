package JMR.Hackathon.BackEnd.Documents.InfrastructureTest;

import JMR.Hackathon.BackEnd.Documents.infraestructure.Hasher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HasherTest {

    // ─────────────────────────────────────────────
    // Determinismo
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("mismo texto → produce el mismo hash siempre")
    void shouldProduceSameHash_whenCalledTwiceWithSameInput() {
        String hash1 = Hasher.sha256("redes neuronales");
        String hash2 = Hasher.sha256("redes neuronales");

        assertEquals(hash1, hash2);
    }

    // ─────────────────────────────────────────────
    // Distinción
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("textos distintos → producen hashes distintos")
    void shouldProduceDifferentHashes_whenInputsDiffer() {
        String hash1 = Hasher.sha256("redes neuronales");
        String hash2 = Hasher.sha256("inteligencia artificial");

        assertNotEquals(hash1, hash2);
    }

    @Test
    @DisplayName("texto en mayúsculas y minúsculas → hashes distintos (case-sensitive)")
    void shouldBeCaseSensitive() {
        String hashLower = Hasher.sha256("java");
        String hashUpper = Hasher.sha256("JAVA");

        assertNotEquals(hashLower, hashUpper);
    }

    // ─────────────────────────────────────────────
    // Formato del resultado
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("SHA-256 → el resultado tiene exactamente 64 caracteres hexadecimales")
    void shouldReturn64CharHexString() {
        String hash = Hasher.sha256("spring boot");

        assertNotNull(hash);
        assertEquals(64, hash.length());
        assertTrue(hash.matches("[a-f0-9]{64}"), "El hash debe ser hexadecimal en minúsculas");
    }

    // ─────────────────────────────────────────────
    // Casos borde
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("texto vacío → no lanza excepción y retorna hash válido")
    void shouldNotThrow_whenInputIsEmpty() {
        assertDoesNotThrow(() -> {
            String hash = Hasher.sha256("");
            assertNotNull(hash);
            assertEquals(64, hash.length());
        });
    }

    @Test
    @DisplayName("texto con caracteres especiales → produce hash válido")
    void shouldHash_whenInputHasSpecialChars() {
        String hash = Hasher.sha256("¡Hola Mundo! @#$%");

        assertNotNull(hash);
        assertEquals(64, hash.length());
    }

    @Test
    @DisplayName("texto muy largo → produce hash de longitud fija")
    void shouldProduceFixedLength_whenInputIsLong() {
        String longText = "a".repeat(10_000);
        String hash = Hasher.sha256(longText);

        assertEquals(64, hash.length());
    }
}
