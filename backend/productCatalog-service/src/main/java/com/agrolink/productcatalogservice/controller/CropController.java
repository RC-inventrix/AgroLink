package com.agrolink.productcatalogservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/crop")
@CrossOrigin(origins = "http://localhost:3000")
public class CropController {

    @Autowired
    private RestTemplate restTemplate; // Inject RestTemplate bean

    @PostMapping("/recommend")
    public String recommendCrop(@RequestBody CropRequest request) {
        String pythonUrl = "http://localhost:5000/predict";
        return restTemplate.postForObject(pythonUrl, request, String.class);
    }
}
