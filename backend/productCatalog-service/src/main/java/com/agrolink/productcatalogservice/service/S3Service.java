package com.agrolink.productcatalogservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {
    private final S3Client s3Client;
    private final String bucketName;

    public S3Service(@Value("${aws.accessKeyId}") String accessKey,
                     @Value("${aws.secretAccessKey}") String secretKey,
                     @Value("${aws.region}") String region,
                     @Value("${aws.s3.bucketName}") String bucketName) {
        this.bucketName = bucketName;
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // 1. Generate unique name
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // 2. Upload to S3
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                //.acl("public-read") // If your bucket allows ACLs
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        // 3. Return the URL
        return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
    }
}
