# KawUZ E-commerce App

This is a simple e-commerce web application built with Spring Boot (backend) and React (frontend) for testing purposes. It uses an H2 in-memory database, so data is reset on each restart.

## 🔹 Backend

Spring Boot REST API

Sample product data preloaded (coffee beans theme)

H2 in-memory database

## Available Endpoints

Endpoint	Method	Description
* /products	GET	List all products
* /product/{id}	GET	Get product by ID
* /product/{id}	PUT	Update product by ID
* /product/{id}	DELETE	Delete product by ID

## H2 Console

URL: http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:testdb

User: sa

Password: (leave empty)

##  Endpoint documentation

URL: http://localhost:8080/swagger-ui.html

Provides API documentation and allows you to test endpoints interactively.

## 🔹 Frontend

### React test page for consuming backend API

Run on port 5173 (Vite dev server)

### Features:

List all products

View product details

Update and delete products

## Start Frontend
* cd frontend\kawuz-react
* npm install
* npm run dev


Open in browser: http://localhost:5173

## ⚡ Notes

The H2 database is in-memory — all changes are lost on restart.

Make sure CORS is enabled in the backend (configured for http://localhost:5173).

Update product price, stock, and availability using the React page or Swagger UI.