const service = require("../services/cart.service");

async function get(req, res, next) {
  try {
    const cart = await service.getCart(req.user);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const cart = await service.addItem(req.user, req.body);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const cart = await service.updateItem(
      req.user,
      req.params.itemId,
      req.body,
    );
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const cart = await service.removeItem(req.user, req.params.itemId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

async function clear(req, res, next) {
  try {
    const cart = await service.clearCart(req.user);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

module.exports = { get, addItem, updateItem, removeItem, clear };
