const axios = require("axios");
const Order = require("../models/order.model");
const { CART_SERVICE_URL, CLEAR_CART_AFTER_ORDER } = require("../config/env");

function getUserId(user) {
  return user && (user.id || user._id || user.sub);
}

function isAdmin(user) {
  return user && user.role === "admin";
}

function getAuthHeader(rawHeader) {
  if (!rawHeader) return "";
  return rawHeader.startsWith("Bearer ") ? rawHeader : `Bearer ${rawHeader}`;
}

async function fetchCart(authHeader) {
  try {
    const response = await axios.get(`${CART_SERVICE_URL}/cart`, {
      headers: { Authorization: getAuthHeader(authHeader) },
      timeout: 5000,
    });
    return response.data;
  } catch (err) {
    const statusCode = err.response ? err.response.status : 502;
    const message = err.response
      ? err.response.data && err.response.data.message
      : `Unable to reach cart-service at ${CART_SERVICE_URL}`;
    const serviceError = new Error(message || "Unable to fetch cart");
    serviceError.statusCode = statusCode;
    throw serviceError;
  }
}

async function clearCart(authHeader) {
  await axios.delete(`${CART_SERVICE_URL}/cart`, {
    headers: { Authorization: getAuthHeader(authHeader) },
    timeout: 5000,
  });
}

function normalizeItems(items) {
  return items.map((item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);
    return {
      productId: item.productId,
      storeId: item.storeId,
      name: item.name || item.productId,
      imageUrl: item.imageUrl,
      price,
      quantity,
      size: item.size,
      subtotal: price * quantity,
    };
  });
}

function buildTotals(items, deliveryFee = 0, tax = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + deliveryFee + tax;
  return { subtotal, deliveryFee, tax, total };
}

async function createOrder(user, data, authHeader) {
  const userId = getUserId(user);
  if (!userId) {
    const err = new Error("User id not found in token");
    err.statusCode = 401;
    throw err;
  }

  let sourceItems = data.items;
  let createdFromCart = false;

  if (!sourceItems || sourceItems.length === 0) {
    const cart = await fetchCart(authHeader);
    sourceItems = cart.items || [];
    createdFromCart = true;
  }

  if (!sourceItems || sourceItems.length === 0) {
    const err = new Error("Cannot create order from an empty cart");
    err.statusCode = 400;
    throw err;
  }

  const items = normalizeItems(sourceItems);
  const totals = buildTotals(items, data.deliveryFee || 0, data.tax || 0);
  const order = await Order.create({
    userId,
    customerUsername: user.username,
    items,
    shippingAddress: data.shippingAddress,
    notes: data.notes,
    ...totals,
  });

  if (createdFromCart && CLEAR_CART_AFTER_ORDER) {
    try {
      await clearCart(authHeader);
    } catch (err) {
      // Order creation should not fail only because cart cleanup failed.
    }
  }

  return order;
}

async function listOrders(user, query = {}) {
  const filter = {};

  if (!isAdmin(user)) {
    filter.userId = getUserId(user);
  } else if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.storeId) filter["items.storeId"] = query.storeId;

  return Order.find(filter).sort({ createdAt: -1 }).limit(100).exec();
}

async function listStoreOrders(storeId, user) {
  if (!isAdmin(user) && getUserId(user) !== storeId) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  return Order.find({ "items.storeId": storeId })
    .sort({ createdAt: -1 })
    .limit(100)
    .exec();
}

async function getOrderById(id, user) {
  const order = await Order.findById(id).exec();
  if (!order) return null;

  const userId = getUserId(user);
  const canAccess =
    isAdmin(user) ||
    order.userId === userId ||
    order.items.some((item) => item.storeId === userId);

  if (!canAccess) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  return order;
}

async function updateOrderStatus(id, data, user) {
  const order = await getOrderById(id, user);
  if (!order) return null;

  const userId = getUserId(user);
  const canUpdate =
    isAdmin(user) || order.items.some((item) => item.storeId === userId);

  if (!canUpdate) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  order.status = data.status;
  if (data.paymentStatus !== undefined) order.paymentStatus = data.paymentStatus;
  return order.save();
}

module.exports = {
  createOrder,
  listOrders,
  listStoreOrders,
  getOrderById,
  updateOrderStatus,
};
