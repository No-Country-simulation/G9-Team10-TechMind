package JMR.Hackathon.BackEnd.Keywords.domain.exception;

public class KeywordNotFoundException extends RuntimeException {

    public KeywordNotFoundException(Long id) {
        super("Keyword not found with id: " + id);
    }

    public KeywordNotFoundException(String keyword) {
        super("Keyword not found: " + keyword);
    }

}