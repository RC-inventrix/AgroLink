package com.agrolink.productcatalogservice.service;

import com.agrolink.productcatalogservice.dto.ProductDTO;
import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.repository.ProductRepository;
import com.agrolink.productcatalogservice.spec.ProductSpecification;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Page<ProductDTO> searchProducts(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String q,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Specification<Product> spec = Specification.where(ProductSpecification.hasCategory(category))
                .and(ProductSpecification.priceGreaterOrEqual(minPrice))
                .and(ProductSpecification.priceLessOrEqual(maxPrice))
                .and(ProductSpecification.nameOrDescriptionContains(q));

        Page<Product> productPage = repo.findAll(spec, pageable);

        return new PageImpl<>(
                productPage.getContent().stream()
                        .map(p -> new ProductDTO(
                                p.getId(), p.getName(), p.getDescription(),
                                p.getCategory(), p.getPrice(), p.getImageUrl()
                        ))
                        .collect(Collectors.toList()),
                pageable,
                productPage.getTotalElements()
        );

    }
}