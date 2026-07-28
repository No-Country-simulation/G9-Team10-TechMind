package JMR.Hackathon.BackEnd.Documents.api.controller;


import JMR.Hackathon.BackEnd.Documents.api.DocumentService;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentRequest;
import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@AllArgsConstructor
@RestController
@RequestMapping("/document")
public class DocumentController {

    private final DocumentService service;


    @PostMapping("/create")
    public DocumentResponse createDocument(@RequestBody @Valid DocumentRequest request) {

        return service.create(request);



    }

    @GetMapping("/all")
    public List<DocumentResponse> getAllDocuments() {

        return service.getAllDocuments();


    }

    @GetMapping("/id/{id}")
    public DocumentResponse getDocumentById(@PathVariable
                                                @Min(value = 1,message = "El ID debe ser mayor que 0")
                                                @NotNull(message = "El ID no puede ser nulo")
                                                Long id) {

        return service.getDocumentById(id);


    }

    @GetMapping("/title/{title}")
    public DocumentResponse getDocumentByTitle(@PathVariable
                                                   @NotBlank(message = "El titulo no puede estar vacio")
                                                   String title) {

        return service.getDocumentByTitle(title);

    }

    @GetMapping("/keyword/{keyword}")
    public List<DocumentResponse> getDocumentByKeyword(@PathVariable
                                                           @NotBlank(message = "La keyword no puede estar vacía")
                                                           String keyword) {

        return service.getDocumentByKeyword(keyword);


    }


    @DeleteMapping("/id/{id}")
    public void deleteDocumentById(@PathVariable
                                       @Min(value = 1,message = "El ID debe ser mayor que 0")
                                       @NotNull(message = "El ID no puede ser nulo")
                                       Long id) {

    service.deleteDocumentById(id);

    }


    @DeleteMapping("/title/{title}")
    public void deleteDocumentByTitle(@PathVariable
                                          @NotBlank(message = "El titulo no puede estar vacio")
                                          String title) {

      service.deleteDocumentByTitle(title);

    }


}
