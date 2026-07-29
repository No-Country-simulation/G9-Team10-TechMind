package JMR.Hackathon.BackEnd.Documents.domain.exception;

/**
 * Excepción lanzada cuando el microservicio FastAPI no está disponible
 * o retorna un error HTTP inesperado.
 */
public class AiServiceException extends RuntimeException {

    public AiServiceException(String message) {
        super(message);
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
