const service = require("../services/order.service");

async function create(req, res, next) {
  try {
    const order = await service.createOrder(
      req.user,
      req.body,
      req.headers.authorization,
    );
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const orders = await service.listOrders(req.user, req.query);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const orders = await service.listOrders(req.user, {});
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getByStore(req, res, next) {
  try {
    const orders = await service.listStoreOrders(req.params.storeId, req.user);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const order = await service.getOrderById(req.params.id, req.user);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const order = await service.updateOrderStatus(
      req.params.id,
      req.body,
      req.user,
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getAll,
  getMine,
  getByStore,
  getById,
  updateStatus,
};
