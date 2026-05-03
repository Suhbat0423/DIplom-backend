# Diplom Backend

Backend services for the e-commerce diploma project.

Frontend should use the API gateway at `http://localhost:8080/api/...`.

## Current services

- `user-service`: user registration, login, and user management
- `product-service`: product CRUD for store-owned products
- `store-service`: store registration, login, and store management
- `cart-service`: authenticated buyer shopping cart management
- `order-service`: checkout and order management
- `payment-service`: payment creation and status management for orders
- `api-gateway`: unified entry point and reverse proxy for all backend services

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

### Payment service

All payment routes require a bearer token. Payment creation validates the order
through `order-service` and uses the order total as the payment amount.

- `POST /payments`
- `GET /payments`
- `GET /payments/order/:orderId`
- `GET /payments/:id`
- `POST /payments/:id/confirm`
- `POST /payments/:id/fail`
- `POST /payments/:id/refund`

### API gateway

Use these gateway prefixes instead of calling each service directly:

- `/api/auth` -> `user-service`
- `/api/users` -> `user-service`
- `/api/products` -> `product-service`
- `/api/categories` -> `product-service`
- `/api/stores/auth` -> `store-service`
- `/api/stores` -> `store-service`
- `/api/cart` -> `cart-service`
- `/api/orders` -> `order-service`
- `/api/payments` -> `payment-service`

## Notes

- User roles currently supported by the model are `buyer`, `seller`, and `admin`.

## Kubernetes autoscaling

`infrastructure/kubernetes/ecom-backend.yaml` provides a production-oriented
baseline for:

- `Deployment` + `Service` for every backend service
- `HorizontalPodAutoscaler` for the API gateway and all application services
- internal service discovery via Kubernetes service DNS
- MongoDB deployment with persistent storage
- shared secrets for MongoDB, JWT, and internal service authentication

Before applying it:

1. Build and push each Docker image to a real registry, then replace the
   placeholder `ghcr.io/your-org/...` image names in
   `infrastructure/kubernetes/ecom-backend.yaml`.
2. Replace the placeholder values in the `ecom-secrets` secret.
3. Make sure your cluster has Metrics Server installed, otherwise HPA will not
   scale on CPU or memory.
4. Apply the manifest with `kubectl apply -f infrastructure/kubernetes/ecom-backend.yaml`.

What was missing for autoscaling:

- no Kubernetes manifests or cloud deployment definition
- no HPA or resource requests/limits
- no replica-safe internal service discovery configuration
- services previously continued starting even when MongoDB connection failed
- process shutdown handling for rolling updates was missing

Current limitation:

- MongoDB is still single-replica in this baseline. The application tier can
  autoscale horizontally, but database high availability needs a replica set or
  managed MongoDB service.
