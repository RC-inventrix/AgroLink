package com.agrolink.productcatalogservice.spec;

import com.agrolink.productcatalogservice.model.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecification {

    public static Specification<Product> hasCategory(String category)
    {
        return (root, query, cb) ->
                category == null || category.isEmpty()
                ? cb.conjunction()
                : cb.equal(root.get("category"), category);
    }

    public static Specification<Product> priceGreaterOrEqual(BigDecimal minPrice) {
        return (root, query, cb) ->
                minPrice == null ? cb.conjunction() : cb.ge(root.get("price"), minPrice);
    }

    public static Specification<Product> priceLessOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) ->
                maxPrice == null ? cb.conjunction() : cb.le(root.get("price"), maxPrice);
    }

    public static Specification<Product> nameOrDescriptionContains(String q)
    {
        return (root, query, cb) -> {
            if (q == null || q.isEmpty()) return cb.conjunction();
            String like = "%" + q.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like)
            );
        };

    }

}
