/* fileName: CropController.java */
package com.agrolink.productcatalogservice.controller;

import com.agrolink.productcatalogservice.dto.CropRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/crop")
public class CropController {

    @Autowired
    private RestTemplate restTemplate;

    // CHANGED: Defaults to localhost for your local IntelliJ development.
    // Docker will override this using the CROP_SERVICE_URL environment variable.
    @Value("${CROP_SERVICE_URL:http://localhost:5000}")
    private String cropServiceUrl;

    @PostMapping("/recommend")
    public ResponseEntity<String> recommendCrop(@RequestBody CropRequest request) {
        String pythonUrl = cropServiceUrl + "/predict";

        try {
            String response = restTemplate.postForObject(pythonUrl, request, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error calling ML Service: " + e.getMessage());
            return ResponseEntity.status(500).body("{\"error\": \"Failed to communicate with AI Service\"}");
        }
    }
}