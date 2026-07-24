package JMR.Hackathon.BackEnd.Documents.domain.exception;

public class InvalidDocumentException extends RuntimeException {

    public InvalidDocumentException(String message) {
        super(message);
    }

}