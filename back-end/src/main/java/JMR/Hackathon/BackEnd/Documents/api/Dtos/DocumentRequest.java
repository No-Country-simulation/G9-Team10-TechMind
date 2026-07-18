package JMR.Hackathon.BackEnd.Documents.api.Dtos;


import lombok.Builder;

@Builder
public record DocumentRequest(
        String title,
        String content
) {
}
