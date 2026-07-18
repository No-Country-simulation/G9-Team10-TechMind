package JMR.Hackathon.BackEnd.Documents.infraestructure;


import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;

@AllArgsConstructor
@Component
public class NormalizedText {

    public String normalize(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        return Normalizer.normalize(text, Normalizer.Form.NFD)
                // Elimina acentos
                .replaceAll("\\p{M}", "")
                // Elimina caracteres de control
                .replaceAll("\\p{Cntrl}", "")
                // Elimina puntuación
                .replaceAll("\\p{P}", "")
                // Convierte espacios
                .replaceAll("\\s+", " ")
                // Minúsculas
                .toLowerCase(Locale.ROOT)
                // Quita espacios al inicio y al final
                .trim();

    }
}
