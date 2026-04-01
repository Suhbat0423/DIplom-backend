# Diplom Backend

Backend services for the e-commerce diploma project.

## Current services

- `user-service`: user registration, login, and user management
- `product-service`: product CRUD for store-owned products
- `store-service`: store registration, login, and store management

## Service structure

Implemented services follow the same layout:

```text
src/
  app.js
  index.js
  config/
  controllers/
  lib/
  middleware/
  models/
  routes/
  services/
  utils/
```

`app.js` builds the Express application.

`index.js` loads config, connects to the database, and starts the HTTP server.

## Routes

### User service

- `POST /auth/register`
- `POST /auth/login`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

### Product service

- `GET /products`
- `POST /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`

### Store service

- `POST /stores/auth/register`
- `POST /stores/auth/login`
- `GET /stores`
- `GET /stores/:id`
- `PUT /stores/:id`
- `DELETE /stores/:id`

## Notes

- User roles currently supported by the model are `buyer`, `seller`, and `admin`.
- The folders `cart-service`, `order-service`, `payment-service`, and `notification-service` are still placeholders and are not wired into `docker-compose.yml`.
