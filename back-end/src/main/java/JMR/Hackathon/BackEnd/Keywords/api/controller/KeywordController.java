package JMR.Hackathon.BackEnd.Keywords.api.controller;


import JMR.Hackathon.BackEnd.Documents.api.Dtos.DocumentResponse;
import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.KeywordService;
import JMR.Hackathon.BackEnd.Keywords.api.mapper.KeywordDTOMapper;
import JMR.Hackathon.BackEnd.Keywords.domain.KeywordRepository;
import lombok.AllArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@AllArgsConstructor
@RestController
@RequestMapping("/keyword")
public class KeywordController {

    private final KeywordService service;

    @GetMapping("/id/{id}")
    public KeywordResponse findById(@PathVariable Long id) {

       return service.FindById(id);
    }

    @GetMapping("/keyword/{keyword}")
    public KeywordResponse findByKeyword(@PathVariable String keyword){
        return service.FindByKeyword(keyword);
    }

    @GetMapping("/findAll")
    public List<KeywordResponse> findAll() {
        return service.FindAll();
    }

    @GetMapping("/title/{title}")
    public List<KeywordResponse>  getKeywordsByTitle(@PathVariable String title) {

        return service.getKeywordsByTitle(title);

    }



    @Transactional
    @DeleteMapping("/id/{id}")
    public void deleteById(@PathVariable Long id){

        service.deleteById(id);
    }


    @DeleteMapping("/keyword/{keyword}")
    public void deleteByKeyword(@PathVariable String keyword){
        service.deleteByKeyword(keyword);
    }







}
