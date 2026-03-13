package com.agrolink.productcatalogservice.controller;

import com.agrolink.productcatalogservice.dto.CropRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/crop")
//@CrossOrigin(origins = "http://localhost:3000")
public class CropController {

    @Autowired
    private RestTemplate restTemplate; // Inject RestTemplate bean

    @Value("${crop.service.url:http://localhost:5000}")
    private String cropServiceUrl;

    @PostMapping("/recommend")
    public String recommendCrop(@RequestBody CropRequest request) {
        String pythonUrl = cropServiceUrl + "/predict";
        return restTemplate.postForObject(pythonUrl, request, String.class);
    }
}
