package JMR.Hackathon.BackEnd.Documents.domain.exception;

public class DocumentNotFoundException extends RuntimeException {

    public DocumentNotFoundException(Long id) {
        super("Document not found with id: " + id);
    }

    public DocumentNotFoundException(String title) {
        super("Document not found with title: " + title);
    }

}
