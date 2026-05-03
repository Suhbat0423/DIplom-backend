const axios = require("axios");
const Payment = require("../models/payment.model");
const { ORDER_SERVICE_URL, INTERNAL_API_KEY } = require("../config/env");

function createError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function getUserId(user) {
  return user && (user.id || user._id || user.sub);
}

function isAdmin(user) {
  return user && user.role === "admin";
}

async function fetchOrder(orderId, authHeader) {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${orderId}`, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });
    return response.data;
  } catch (err) {
    const statusCode = err.response ? err.response.status : 502;
    const message = err.response
      ? err.response.data && err.response.data.message
      : `Unable to reach order-service at ${ORDER_SERVICE_URL}`;
    throw createError(message || "Unable to fetch order", statusCode);
  }
}

async function syncOrderPaymentStatus(orderId, paymentStatus) {
  try {
    await axios.put(
      `${ORDER_SERVICE_URL}/orders/${orderId}/payment-status`,
      { paymentStatus },
      {
        headers: { "x-internal-api-key": INTERNAL_API_KEY },
        timeout: 5000,
      },
    );
  } catch (err) {
    const statusCode = err.response ? err.response.status : 502;
    const message = err.response
      ? err.response.data && err.response.data.message
      : `Unable to reach order-service at ${ORDER_SERVICE_URL}`;
    throw createError(message || "Unable to sync order payment status", statusCode);
  }
}

async function createPayment(user, data, authHeader) {
  const userId = getUserId(user);
  if (!userId) {
    throw createError("User id not found in token", 401);
  }

  const order = await fetchOrder(data.orderId, authHeader);
  if (!order) {
    throw createError("Order not found", 404);
  }
  if (order.paymentStatus === "paid") {
    throw createError("Order is already paid", 400);
  }

  const existingPaid = await Payment.findOne({
    orderId: data.orderId,
    userId,
    status: "paid",
  }).exec();
  if (existingPaid) {
    throw createError("Payment already completed for this order", 400);
  }

  const existingPending = await Payment.findOne({
    orderId: data.orderId,
    userId,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .exec();
  if (existingPending) {
    return existingPending;
  }

  return Payment.create({
    orderId: order._id || data.orderId,
    orderNumber: order.orderNumber,
    userId,
    amount: Number(order.total || 0),
    currency: data.currency,
    method: data.method,
    provider: data.provider,
    notes: data.notes,
    metadata: data.metadata,
  });
}

async function listPayments(user, query = {}) {
  const filter = {};
  const userId = getUserId(user);

  if (!isAdmin(user)) {
    filter.userId = userId;
  } else if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.orderId) filter.orderId = query.orderId;
  if (query.status) filter.status = query.status;
  if (query.method) filter.method = query.method;

  return Payment.find(filter).sort({ createdAt: -1 }).limit(100).exec();
}

async function getPaymentById(id, user) {
  const payment = await Payment.findById(id).exec();
  if (!payment) return null;

  const userId = getUserId(user);
  if (!isAdmin(user) && payment.userId !== userId) {
    throw createError("Forbidden", 403);
  }

  return payment;
}

async function getPaymentByOrderId(orderId, user) {
  const payment = await Payment.findOne({ orderId })
    .sort({ createdAt: -1 })
    .exec();
  if (!payment) return null;

  const userId = getUserId(user);
  if (!isAdmin(user) && payment.userId !== userId) {
    throw createError("Forbidden", 403);
  }

  return payment;
}

async function confirmPayment(id, data, user) {
  const payment = await getPaymentById(id, user);
  if (!payment) return null;

  if (payment.status === "paid") {
    return payment;
  }
  if (payment.status === "refunded") {
    throw createError("Refunded payment cannot be confirmed", 400);
  }

  payment.status = "paid";
  payment.transactionId =
    data.transactionId || payment.transactionId || `TXN-${Date.now()}`;
  payment.providerReference =
    data.providerReference || payment.providerReference || "";
  payment.failureReason = "";
  payment.paidAt = new Date();
  if (data.metadata) {
    payment.metadata = { ...(payment.metadata || {}), ...data.metadata };
  }

  await payment.save();
  await syncOrderPaymentStatus(payment.orderId, "paid");

  return payment;
}

async function failPayment(id, data, user) {
  const payment = await getPaymentById(id, user);
  if (!payment) return null;

  if (payment.status === "paid" || payment.status === "refunded") {
    throw createError("Completed payment cannot be marked as failed", 400);
  }

  payment.status = "failed";
  payment.failureReason = data.reason || payment.failureReason || "Payment failed";
  payment.transactionId = data.transactionId || payment.transactionId || "";
  payment.failedAt = new Date();
  if (data.metadata) {
    payment.metadata = { ...(payment.metadata || {}), ...data.metadata };
  }

  await payment.save();
  await syncOrderPaymentStatus(payment.orderId, "failed");

  return payment;
}

async function refundPayment(id, data, user) {
  if (!isAdmin(user)) {
    throw createError("Forbidden: admin only", 403);
  }

  const payment = await getPaymentById(id, user);
  if (!payment) return null;

  if (payment.status !== "paid") {
    throw createError("Only paid payments can be refunded", 400);
  }

  payment.status = "refunded";
  payment.refundedAt = new Date();
  payment.failureReason = data.reason || "";
  if (data.metadata) {
    payment.metadata = { ...(payment.metadata || {}), ...data.metadata };
  }

  await payment.save();
  await syncOrderPaymentStatus(payment.orderId, "refunded");

  return payment;
}

module.exports = {
  createPayment,
  listPayments,
  getPaymentById,
  getPaymentByOrderId,
  confirmPayment,
  failPayment,
  refundPayment,
};
