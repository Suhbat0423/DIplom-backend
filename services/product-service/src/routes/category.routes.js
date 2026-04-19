const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const auth = require("../middleware/auth.middleware");
const { validate, schemas } = require("../middleware/validate.middleware");

router.get("/", controller.getAll);
router.post("/", auth, validate(schemas.createCategory), controller.create);
router.get("/:id", controller.getById);
router.put("/:id", auth, validate(schemas.updateCategory), controller.update);
router.delete("/:id", auth, controller.remove);

module.exports = router;
