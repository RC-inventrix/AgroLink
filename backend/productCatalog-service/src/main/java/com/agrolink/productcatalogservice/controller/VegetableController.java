package com.agrolink.productcatalogservice.controller;


import com.agrolink.productcatalogservice.model.Vegetable;
import com.agrolink.productcatalogservice.service.VegetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/vegetables")
@RequiredArgsConstructor
public class VegetableController {

    private final VegetableService service;

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/add")
    public ResponseEntity<?> addVegetable(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String listingType,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Double startingBid,
            @RequestParam(required = false)MultipartFile image
    ){
        try {
            String filePath = null;

            if(image!=null){
                byte[] bytes = image.getBytes();
                Path path = Paths.get(UPLOAD_DIR + image.getOriginalFilename());
                Files.write(path, bytes);
                filePath = path.toString();
            }

            Vegetable v = Vegetable.builder()
                    .name(name)
                    .description(description)
                    .listingType(listingType)
                    .price(price)
                    .startingBid(startingBid)
                    .imageUrl(filePath)
                    .build();

            return ResponseEntity.ok(service.save(v));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Vegetable>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }



}
