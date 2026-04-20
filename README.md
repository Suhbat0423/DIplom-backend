# Diplom Backend

Backend services for the e-commerce diploma project.

## Current services

- `user-service`: user registration, login, and user management
- `product-service`: product CRUD for store-owned products
- `store-service`: store registration, login, and store management
- `cart-service`: authenticated buyer shopping cart management
- `order-service`: checkout and order management

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
- `GET /products/store/:storeId`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /categories`
- `POST /categories`
- `GET /categories/:id`
- `PUT /categories/:id`
- `DELETE /categories/:id`

Products support optional `imageUrl`, `categoryId`, and `sizes` fields on create
and update requests. Supported sizes are `XS`, `S`, `SM`, `M`, `MD`, `L`, `LG`,
`XL`, and `XXL`.
Products can be filtered with `GET /products?storeId=...&categoryId=...`.

### Store service

- `POST /stores/auth/register`
- `POST /stores/auth/login`
- `GET /stores`
- `GET /stores/:id`
- `PUT /stores/:id`
- `DELETE /stores/:id`

### Cart service

All cart routes require a bearer token from `user-service`.

- `GET /cart`
- `POST /cart/items`
- `PUT /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`

Cart items accept `productId` and `quantity`, with optional selected `size` and
product snapshot fields: `name`, `imageUrl`, `price`, and `storeId`. Supported
cart item sizes are `XS`, `S`, `SM`, `M`, `MD`, `L`, `LG`, `XL`, and `XXL`.

### Order service

All order routes require a bearer token. `POST /orders` can create an order from
the current cart when no `items` array is provided, or from explicit `items`.

- `POST /orders`
- `GET /orders`
- `GET /orders/my`
- `GET /orders/store/:storeId`
- `GET /orders/:id`
- `PUT /orders/:id/status`

Order item snapshots include `productId`, `storeId`, `name`, `imageUrl`, `price`,
`quantity`, `size`, and `subtotal`.

## Notes

- User roles currently supported by the model are `buyer`, `seller`, and `admin`.
- The folders `payment-service` and `notification-service` are still placeholders and are not wired into `docker-compose.yml`.
