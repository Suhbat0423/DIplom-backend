import http from "k6/http";
import { check, fail, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const LOGIN_PATH = __ENV.LOGIN_PATH || "/api/auth/login";
const ORDERS_PATH = __ENV.ORDERS_PATH || "/api/orders";
const TEST_EMAIL = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || "1m",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"],
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
    {
      headers: { "Content-Type": "application/json" },
    },
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

export function setup() {
  return { token: login() };
}

export default function (data) {
  const token = data.token;
  const iterationId = `${__VU}-${__ITER}`;

  const payload = {
    items: [
      {
        productId: `load-product-${iterationId}`,
        storeId: __ENV.STORE_ID || "load-store-1",
        name: "Load Test Product",
        imageUrl: "",
        price: Number(__ENV.ITEM_PRICE || 25000),
        quantity: Number(__ENV.ITEM_QUANTITY || 1),
        size: __ENV.ITEM_SIZE || "M",
      },
    ],
    shippingAddress: {
      fullName: "Load Test Buyer",
      phone: "99999999",
      city: "Ulaanbaatar",
      district: "Sukhbaatar",
      addressLine1: "Load Test Street",
      addressLine2: "",
      postalCode: "14200",
    },
    deliveryFee: Number(__ENV.DELIVERY_FEE || 5000),
    tax: Number(__ENV.TAX || 0),
    notes: `order-load-${iterationId}`,
  };

  const response = http.post(
    `${BASE_URL}${ORDERS_PATH}`,
    JSON.stringify(payload),
    jsonHeaders(token),
  );

  check(response, {
    "order create status is 201": (r) => r.status === 201,
    "order create returned id": (r) => {
      try {
        return Boolean(r.json("_id"));
      } catch (err) {
        return false;
      }
    },
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
