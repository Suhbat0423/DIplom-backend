import http from "k6/http";
import { check, fail } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const LOGIN_PATH = __ENV.LOGIN_PATH || "/api/auth/login";
const TEST_EMAIL = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

export const options = {
  stages: [
    { duration: __ENV.STAGE_1_DURATION || "30s", target: Number(__ENV.STAGE_1_TARGET || 25) },
    { duration: __ENV.STAGE_2_DURATION || "30s", target: Number(__ENV.STAGE_2_TARGET || 75) },
    { duration: __ENV.STAGE_3_DURATION || "30s", target: Number(__ENV.STAGE_3_TARGET || 125) },
    { duration: __ENV.STAGE_4_DURATION || "30s", target: Number(__ENV.STAGE_4_TARGET || 175) },
    { duration: __ENV.STAGE_5_DURATION || "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<2500"],
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

export function setup() {
  return { token: login() };
}

export default function (data) {
  const token = data.token;
  const iterationId = `${__VU}-${__ITER}`;
  const mod = __ITER % 4;

  if (mod === 0) {
    const response = http.get(`${BASE_URL}/health`);
    check(response, {
      "gateway health status is 200": (r) => r.status === 200,
    });
    return;
  }

  if (mod === 1) {
    const response = http.get(`${BASE_URL}/routes`);
    check(response, {
      "gateway routes status is 200": (r) => r.status === 200,
    });
    return;
  }

  if (mod === 2) {
    const response = http.get(`${BASE_URL}/api/cart`, jsonHeaders(token));
    check(response, {
      "gateway cart proxy status is 200": (r) => r.status === 200,
    });
    return;
  }

  const response = http.post(
    `${BASE_URL}/api/cart/items`,
    JSON.stringify({
      productId: `gateway-product-${iterationId}`,
      quantity: 1,
      name: "Gateway Stress Product",
      imageUrl: "",
      price: Number(__ENV.ITEM_PRICE || 25000),
      storeId: __ENV.STORE_ID || "load-store-1",
      size: __ENV.ITEM_SIZE || "M",
    }),
    jsonHeaders(token),
  );

  check(response, {
    "gateway write proxy status is 201": (r) => r.status === 201,
  });
}
