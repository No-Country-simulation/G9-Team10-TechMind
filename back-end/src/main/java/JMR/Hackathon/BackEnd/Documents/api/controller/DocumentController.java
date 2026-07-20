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


    @PostMapping("/create")
    public DocumentResponse createDocument(@RequestBody  DocumentRequest request) {

        return service.create(request);



    }

    @GetMapping("/all")
    public List<DocumentResponse> getAllDocuments() {

        return service.getAllDocuments();


    }

    @GetMapping("/{id}")
    public DocumentResponse getDocumentById(@PathVariable Long id) {

        return service.getDocumentById(id);


    }

    @GetMapping("/{title}")
    public DocumentResponse getDocumentsByTitle(@PathVariable String title) {

        return service.getDocumentsByTitle(title);

    }

    @GetMapping("/keyword/{title}")
    public List<String> getKeywordsByTitle(@PathVariable String title) {

        return service.getKeywordsByTitle(title);

    }




    @DeleteMapping("/id/{id}")
    public void deleteDocumentById(@PathVariable Long id) {

    service.deleteDocumentById(id);

    }


    @DeleteMapping("/title/{title}")
    public void deleteDocumentByTitle(@PathVariable String title) {

      service.deleteDocumentByTitle(title);

    }


}
