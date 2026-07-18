package JMR.Hackathon.BackEnd.Documents.api.Dtos;


import lombok.Builder;

@Builder
public record DocumentResponse(
        String title,
        String content

) {
}
