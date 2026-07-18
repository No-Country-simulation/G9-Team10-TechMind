package JMR.Hackathon.BackEnd.Documents.api.controller;


import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import lombok.AllArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController("/document")
public class DocumentController {

    private final DocumentService service;

    @Transactional
    @PostMapping("/create")
    public DocumentResponse createDocument(@RequestBody  DocumentRequest request) {

        //return service.create(request);


        return null;
    }

    @GetMapping("/all")
    public List<DocumentResponse> getAllDocuments() {

        //return service.getAllDocuments();

        return null;
    }

    @GetMapping("/{id}")
    public DocumentResponse getDocumentById(@PathVariable String id) {

        //return service.getDocumentById(id);

        return null;
    }

    @GetMapping("/{title}")
    public List<DocumentResponse> getDocumentsByTitle(@PathVariable String title) {

        //return service.getDocumentsByTitle(title);

        return null;
    }

    @Transactional
    @DeleteMapping("/delete/{id}")
    public void deleteDocumentById(@PathVariable String id) {

    // service.deleteDocumentById(id);

    }

    @Transactional
    @DeleteMapping("/delete/{title}")
    public void deleteDocumentByTitle(@PathVariable String title) {

        // service.deleteDocumentByTitle(title)

    }


}
