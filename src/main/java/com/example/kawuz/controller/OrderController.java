package com.example.kawuz.controller;

import com.example.kawuz.entity.Product;
import com.example.kawuz.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final ProductService productService;

    public OrderController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/create")
    public ResponseEntity<String> placeOrder(@RequestBody List<OrderItem> items) {
        for (OrderItem item : items) {
            Product product = productService.getProductById(item.getProductId());

            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Nie znaleziono produktu: " + item.getProductId());
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                return ResponseEntity.badRequest()
                        .body("Nie ma wystarczającej liczby produktu: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            product.setSales(product.getSales() + item.getQuantity());
            productService.updateProduct(product, product.getId());
        }

        return ResponseEntity.ok("Zamówienie zostało złożone!");
    }

    public static class OrderItem {
        private int productId;
        private int quantity;

        public int getProductId() { return productId; }
        public void setProductId(int productId) { this.productId = productId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
