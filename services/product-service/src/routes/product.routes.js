const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const auth = require("../middleware/auth.middleware");
const { validate, schemas } = require("../middleware/validate.middleware");

router.get("/", controller.getAll);
router.post("/", auth, validate(schemas.createProduct), controller.create);
router.get("/:id", controller.getById);
router.put("/:id", auth, validate(schemas.updateProduct), controller.update);
router.delete("/:id", auth, controller.remove);

module.exports = router;
