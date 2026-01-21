package com.agrolink.productcatalogservice.repository;

import com.agrolink.productcatalogservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// No @Repository needed here
public interface ProductRepository extends JpaRepository<Product, Long> {
    // You can add custom queries here later, e.g.:
    // List<Product> findByCategory(String category);
    List<Product> findByFarmerId(Long farmerId);
}