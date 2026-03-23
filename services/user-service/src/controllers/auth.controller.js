const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    // defensive: ensure body is present (helps when Content-Type is missing)
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({
          message: "Request body required (Content-Type: application/json)",
        });
    }

    // helpful debug log (removed in production if needed)
    // console.log('login request body:', req.body);

    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
