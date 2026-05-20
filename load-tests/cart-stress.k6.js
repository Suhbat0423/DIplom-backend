import http from "k6/http";
import { check, fail } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const LOGIN_PATH = __ENV.LOGIN_PATH || "/api/auth/login";
const CART_PATH = __ENV.CART_PATH || "/api/cart";
const TEST_EMAIL = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

export const options = {
  stages: [
    { duration: __ENV.STAGE_1_DURATION || "30s", target: Number(__ENV.STAGE_1_TARGET || 20) },
    { duration: __ENV.STAGE_2_DURATION || "30s", target: Number(__ENV.STAGE_2_TARGET || 50) },
    { duration: __ENV.STAGE_3_DURATION || "30s", target: Number(__ENV.STAGE_3_TARGET || 100) },
    { duration: __ENV.STAGE_4_DURATION || "30s", target: Number(__ENV.STAGE_4_TARGET || 150) },
    { duration: __ENV.STAGE_5_DURATION || "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<3000"],
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

function getLastItemId(cartPayload) {
  if (!cartPayload || !Array.isArray(cartPayload.items) || cartPayload.items.length === 0) {
    return "";
  }

  const last = cartPayload.items[cartPayload.items.length - 1];
  return last && (last._id || last.id) ? last._id || last.id : "";
}

export function setup() {
  return { token: login() };
}

export default function (data) {
  const token = data.token;
  const iterationId = `${__VU}-${__ITER}`;

  const addResponse = http.post(
    `${BASE_URL}${CART_PATH}/items`,
    JSON.stringify({
      productId: `stress-cart-product-${iterationId}`,
      quantity: Number(__ENV.ITEM_QUANTITY || 1),
      name: "Stress Cart Product",
      imageUrl: "",
      price: Number(__ENV.ITEM_PRICE || 25000),
      storeId: __ENV.STORE_ID || "load-store-1",
      size: __ENV.ITEM_SIZE || "M",
    }),
    jsonHeaders(token),
  );

  const addOk = check(addResponse, {
    "cart add status is 201": (r) => r.status === 201,
  });

  if (!addOk) {
    fail(`Cart add failed: ${addResponse.status} ${addResponse.body}`);
  }

  const cart = addResponse.json();
  const itemId = getLastItemId(cart);

  if (itemId) {
    const updateResponse = http.put(
      `${BASE_URL}${CART_PATH}/items/${itemId}`,
      JSON.stringify({
        quantity: Number(__ENV.UPDATE_QUANTITY || 2),
      }),
      jsonHeaders(token),
    );

    check(updateResponse, {
      "cart update status is 200": (r) => r.status === 200,
    });
  }

  if (__ITER % 5 === 0) {
    const clearResponse = http.del(
      `${BASE_URL}${CART_PATH}`,
      null,
      jsonHeaders(token),
    );

    check(clearResponse, {
      "cart clear status is 200": (r) => r.status === 200,
    });
  } else {
    const getResponse = http.get(`${BASE_URL}${CART_PATH}`, jsonHeaders(token));
    check(getResponse, {
      "cart get status is 200": (r) => r.status === 200,
    });
  }
}
