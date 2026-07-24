package JMR.Hackathon.BackEnd.Documents.domain.exception;


public class DocumentAlreadyExistsException extends RuntimeException {

    public DocumentAlreadyExistsException(String hash) {
        super("Document already exists with hash: " + hash);
    }

}