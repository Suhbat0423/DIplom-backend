const {
  USER_SERVICE_URL,
  PRODUCT_SERVICE_URL,
  STORE_SERVICE_URL,
  CART_SERVICE_URL,
  ORDER_SERVICE_URL,
  PAYMENT_SERVICE_URL,
} = require("../config/env");

module.exports = [
  {
    mountPath: "/api/auth",
    target: USER_SERVICE_URL,
    upstreamPath: "/auth",
  },
  {
    mountPath: "/api/users",
    target: USER_SERVICE_URL,
    upstreamPath: "/users",
  },
  {
    mountPath: "/api/products",
    target: PRODUCT_SERVICE_URL,
    upstreamPath: "/products",
  },
  {
    mountPath: "/api/categories",
    target: PRODUCT_SERVICE_URL,
    upstreamPath: "/categories",
  },
  {
    mountPath: "/api/stores/auth",
    target: STORE_SERVICE_URL,
    upstreamPath: "/stores/auth",
  },
  {
    mountPath: "/api/stores",
    target: STORE_SERVICE_URL,
    upstreamPath: "/stores",
  },
  {
    mountPath: "/api/cart",
    target: CART_SERVICE_URL,
    upstreamPath: "/cart",
  },
  {
    mountPath: "/api/orders",
    target: ORDER_SERVICE_URL,
    upstreamPath: "/orders",
  },
  {
    mountPath: "/api/payments",
    target: PAYMENT_SERVICE_URL,
    upstreamPath: "/payments",
  },
];
