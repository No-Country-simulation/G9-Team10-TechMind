package JMR.Hackathon.BackEnd.Documents.api.Dtos;


import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record DocumentRequest(
        @NotBlank(message = "El titulo es obligatorio")
        String title,
        @NotBlank(message = "El contenido es obligatorio")
        String content

) {
}
