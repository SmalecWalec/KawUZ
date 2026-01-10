package com.example.kawuz.controller;

import com.example.kawuz.entity.Product;
import com.example.kawuz.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.lowagie.text.pdf.BaseFont;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class ProductController {
    ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(){
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id){

        Product product = productService.getProductById(id);

        if(product != null)
            return new ResponseEntity<>(product, HttpStatus.OK);
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable int id,
                                                @RequestBody Product product){

        Product product1 = null;
        product1 = productService.updateProduct(product, id);

        if (product1 != null)
            return new ResponseEntity<>("Updated", HttpStatus.OK);
        else
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);

    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id){
        Product product = productService.getProductById(id);
        if(product != null) {
            productService.deleteProduct(id);
            return new ResponseEntity<>("Deleted", HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/product/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        List<Product> results = productService.searchProducts(keyword);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/product")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.addProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @GetMapping("/product/{id}/pdf")
    public void generatePdf(@PathVariable int id, HttpServletResponse response) throws IOException {
        Product product = productService.getProductById(id);

        if (product == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
            return;
        }

        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String filename = "oferta_" + product.getName().replace(" ", "_") + ".pdf";
        response.setHeader(headerKey, "attachment; filename=" + filename);

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, BaseFont.CP1250, BaseFont.EMBEDDED, 20);
        Font fontText = FontFactory.getFont(FontFactory.HELVETICA, BaseFont.CP1250, BaseFont.EMBEDDED, 12);

        Paragraph title = new Paragraph("Oferta KawUZ: " + product.getName(), fontTitle);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph("\n"));

        document.add(new Paragraph("Cena: " + product.getPrice() + " zł", fontText));

        if (product.getDescription() != null) {
            document.add(new Paragraph("\nOpis:", fontText));
            document.add(new Paragraph(product.getDescription(), fontText));
        }

        document.add(new Paragraph("\n\n-----------------------------"));
        document.add(new Paragraph("Wygenerowano z KawUZ", FontFactory.getFont(FontFactory.COURIER, BaseFont.CP1250, BaseFont.EMBEDDED, 10)));

        document.close();
    }
}

