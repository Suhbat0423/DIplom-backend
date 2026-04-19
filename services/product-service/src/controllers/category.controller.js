const service = require("../services/category.service");

async function create(req, res, next) {
  try {
    const result = await service.createCategory(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const items = await service.listCategories();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getCategoryById(req.params.id);
    if (!item) return res.status(404).json({ message: "Category not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const updated = await service.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await service.deleteCategory(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getById, update, remove };
