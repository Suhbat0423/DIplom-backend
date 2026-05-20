import http from "k6/http";
import { check, fail } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const LOGIN_PATH = __ENV.LOGIN_PATH || "/api/auth/login";
const CART_PATH = __ENV.CART_PATH || "/api/cart";
const ORDERS_PATH = __ENV.ORDERS_PATH || "/api/orders";
const PAYMENTS_PATH = __ENV.PAYMENTS_PATH || "/api/payments";
const TEST_EMAIL = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

export const options = {
  stages: [
    { duration: __ENV.STAGE_1_DURATION || "30s", target: Number(__ENV.STAGE_1_TARGET || 25) },
    { duration: __ENV.STAGE_2_DURATION || "30s", target: Number(__ENV.STAGE_2_TARGET || 75) },
    { duration: __ENV.STAGE_3_DURATION || "30s", target: Number(__ENV.STAGE_3_TARGET || 125) },
    { duration: __ENV.STAGE_4_DURATION || "30s", target: Number(__ENV.STAGE_4_TARGET || 200) },
    { duration: __ENV.STAGE_5_DURATION || "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.15"],
    http_req_duration: ["p(95)<5000"],
  },
};

function jsonHeaders(token) {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
}

function login() {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    fail("TEST_EMAIL and TEST_PASSWORD env vars are required");
  }

  const response = http.post(
    `${BASE_URL}${LOGIN_PATH}`,
    JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
    { headers: { "Content-Type": "application/json" } },
  );

  const ok = check(response, {
    "login status is 200": (r) => r.status === 200,
    "login returned token": (r) => {
      try {
        return Boolean(r.json("token"));
      } catch (err) {
        return false;
      }
    },
  });

  if (!ok) {
    fail(`Login failed: ${response.status} ${response.body}`);
  }

  return response.json("token");
}

function createOrder(token, iterationId) {
  const response = http.post(
    `${BASE_URL}${ORDERS_PATH}`,
    JSON.stringify({
      items: [
        {
          productId: `db-saturation-product-${iterationId}`,
          storeId: __ENV.STORE_ID || "load-store-1",
          name: "DB Saturation Product",
          imageUrl: "",
          price: Number(__ENV.ITEM_PRICE || 25000),
          quantity: Number(__ENV.ITEM_QUANTITY || 1),
          size: __ENV.ITEM_SIZE || "M",
        },
      ],
      shippingAddress: {
        fullName: "DB Stress Buyer",
        phone: "99999999",
        city: "Ulaanbaatar",
        district: "Sukhbaatar",
        addressLine1: "DB Stress Street",
        addressLine2: "",
        postalCode: "14200",
      },
      deliveryFee: Number(__ENV.DELIVERY_FEE || 5000),
      tax: Number(__ENV.TAX || 0),
      notes: `db-stress-order-${iterationId}`,
    }),
    jsonHeaders(token),
  );

  const ok = check(response, {
    "db stress order status is 201": (r) => r.status === 201,
  });

  if (!ok) {
    fail(`Order creation failed: ${response.status} ${response.body}`);
  }

  return response.json();
}

export function setup() {
  return { token: login() };
}

export default function (data) {
  const token = data.token;
  const iterationId = `${__VU}-${__ITER}`;

  const cartAdd = http.post(
    `${BASE_URL}${CART_PATH}/items`,
    JSON.stringify({
      productId: `db-cart-product-${iterationId}`,
      quantity: 1,
      name: "DB Cart Product",
      imageUrl: "",
      price: Number(__ENV.ITEM_PRICE || 25000),
      storeId: __ENV.STORE_ID || "load-store-1",
      size: __ENV.ITEM_SIZE || "M",
    }),
    jsonHeaders(token),
  );

  check(cartAdd, {
    "db stress cart add status is 201": (r) => r.status === 201,
  });

  const order = createOrder(token, iterationId);

  const paymentCreateResponse = http.post(
    `${BASE_URL}${PAYMENTS_PATH}`,
    JSON.stringify({
      orderId: order._id,
      method: __ENV.PAYMENT_METHOD || "card",
      currency: __ENV.CURRENCY || "MNT",
      provider: __ENV.PAYMENT_PROVIDER || "manual",
      notes: `db-stress-payment-${iterationId}`,
      metadata: { source: "k6-db-saturation" },
    }),
    jsonHeaders(token),
  );

  const paymentCreateOk = check(paymentCreateResponse, {
    "db stress payment create status is 201 or 200": (r) =>
      r.status === 201 || r.status === 200,
  });

  if (!paymentCreateOk) {
    fail(
      `Payment creation failed: ${paymentCreateResponse.status} ${paymentCreateResponse.body}`,
    );
  }

  const payment = paymentCreateResponse.json();
  const confirmResponse = http.post(
    `${BASE_URL}${PAYMENTS_PATH}/${payment._id}/confirm`,
    JSON.stringify({
      transactionId: `db-stress-txn-${Date.now()}-${iterationId}`,
      providerReference: `db-stress-provider-${iterationId}`,
      metadata: { source: "k6-db-saturation-confirm" },
    }),
    jsonHeaders(token),
  );

  check(confirmResponse, {
    "db stress payment confirm status is 200": (r) => r.status === 200,
  });
}
