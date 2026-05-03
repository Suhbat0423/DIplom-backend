const service = require("../services/payment.service");

async function create(req, res, next) {
  try {
    const payment = await service.createPayment(
      req.user,
      req.body,
      req.headers.authorization,
    );
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const payments = await service.listPayments(req.user, req.query);
    res.json(payments);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const payment = await service.getPaymentById(req.params.id, req.user);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

async function getByOrderId(req, res, next) {
  try {
    const payment = await service.getPaymentByOrderId(req.params.orderId, req.user);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

async function confirm(req, res, next) {
  try {
    const payment = await service.confirmPayment(req.params.id, req.body, req.user);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

async function fail(req, res, next) {
  try {
    const payment = await service.failPayment(req.params.id, req.body, req.user);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

async function refund(req, res, next) {
  try {
    const payment = await service.refundPayment(req.params.id, req.body, req.user);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getByOrderId,
  confirm,
  fail,
  refund,
};
