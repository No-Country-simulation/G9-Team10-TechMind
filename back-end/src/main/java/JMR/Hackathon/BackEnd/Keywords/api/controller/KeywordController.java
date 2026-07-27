package JMR.Hackathon.BackEnd.Keywords.api.controller;


import JMR.Hackathon.BackEnd.Keywords.api.Dtos.KeywordResponse;
import JMR.Hackathon.BackEnd.Keywords.api.KeywordService;
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

       return service.findById(id);
    }

    @GetMapping("/keyword/{keyword}")
    public KeywordResponse findByKeyword(@PathVariable String keyword){
        return service.findByKeyword(keyword);
    }

    @GetMapping("/findAll")
    public List<KeywordResponse> findAll() {
        return service.findAll();
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
