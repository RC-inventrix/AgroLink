package com.agrolink.productcatalogservice;

import com.agrolink.productcatalogservice.dto.ProductRequestDTO;
import com.agrolink.productcatalogservice.model.PriceType;
import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.repository.ProductRepository;
import com.agrolink.productcatalogservice.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private ProductRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new ProductRequestDTO();
        validRequest.setFarmerId(1L);
        validRequest.setVegetableName("Tomato");
        validRequest.setCategory("Vegetable");
        validRequest.setQuantity(100.0);
        validRequest.setPricingType("FIXED");
        validRequest.setFixedPrice(150.0);
        validRequest.setDescription("Fresh organic tomatoes");
        validRequest.setDeliveryAvailable(true);
    }

    @Test
    void createProduct_shouldSaveAndReturnProduct() {
        Product saved = Product.builder()
                .id(1L)
                .farmerId(1L)
                .vegetableName("Tomato")
                .quantity(100.0)
                .pricingType(PriceType.FIXED)
                .fixedPrice(150.0)
                .build();
        when(productRepository.save(any(Product.class))).thenReturn(saved);

        Product result = productService.createProduct(validRequest);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getVegetableName()).isEqualTo("Tomato");
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void createProduct_shouldDefaultToFixedPriceOnInvalidPricingType() {
        validRequest.setPricingType("UNKNOWN_TYPE");
        Product saved = Product.builder().id(2L).pricingType(PriceType.FIXED).build();
        when(productRepository.save(any(Product.class))).thenReturn(saved);

        Product result = productService.createProduct(validRequest);

        assertThat(result.getPricingType()).isEqualTo(PriceType.FIXED);
    }

    @Test
    void getAllProducts_shouldReturnAllProducts() {
        List<Product> products = List.of(
                Product.builder().id(1L).vegetableName("Tomato").build(),
                Product.builder().id(2L).vegetableName("Carrot").build()
        );
        when(productRepository.findAll()).thenReturn(products);

        List<Product> result = productService.getAllProducts();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getVegetableName()).isEqualTo("Tomato");
    }

    @Test
    void getProductsByFarmerId_shouldReturnFarmerProducts() {
        List<Product> products = List.of(
                Product.builder().id(1L).farmerId(1L).vegetableName("Tomato").build()
        );
        when(productRepository.findByFarmerId(1L)).thenReturn(products);

        List<Product> result = productService.getProductsByFarmerId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFarmerId()).isEqualTo(1L);
    }

    @Test
    void deleteProduct_shouldDeleteWhenProductExists() {
        when(productRepository.existsById(1L)).thenReturn(true);

        productService.deleteProduct(1L);

        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteProduct_shouldThrowWhenProductNotFound() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> productService.deleteProduct(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void updateProduct_shouldUpdateExistingProduct() {
        Product existing = Product.builder().id(1L).vegetableName("OldName").build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        validRequest.setVegetableName("NewTomato");
        Product result = productService.updateProduct(1L, validRequest);

        assertThat(result.getVegetableName()).isEqualTo("NewTomato");
    }

    @Test
    void updateProduct_shouldThrowWhenProductNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.updateProduct(99L, validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }
}
