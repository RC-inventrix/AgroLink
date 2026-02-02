package com.agrolink.productcatalogservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Presigner s3Presigner; // Use Presigner instead of Client for this
    private final String bucketName;
    private final String region;

    public S3Service(@Value("${aws.accessKeyId}") String accessKey,
                     @Value("${aws.secretAccessKey}") String secretKey,
                     @Value("${aws.region}") String region,
                     @Value("${aws.s3.bucketName}") String bucketName) {
        this.bucketName = bucketName;
        this.region = region;

        this.s3Presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    // Generates a secure URL that the Frontend can use to upload directly
    public String generatePresignedUrl(String originalFilename, String contentType) {
        String fileName = UUID.randomUUID() + "_" + originalFilename;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(contentType) // Critical: Matches the file type (image/png etc)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10)) // Link valid for 10 mins
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        // Return the full Upload URL
        return presignedRequest.url().toString();
    }

    // Helper to get the final public URL based on the file name
    public String getPublicUrl(String presignedUrl) {
        // Extract the key (filename) from the messy presigned URL
        // Presigned URL: https://bucket.s3.amazonaws.com/FILENAME?signature...
        try {
            java.net.URL url = new java.net.URL(presignedUrl);
            return "https://" + bucketName + ".s3." + region + ".amazonaws.com" + url.getPath();
        } catch (Exception e) {
            return "";
        }
    }
}