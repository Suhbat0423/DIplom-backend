const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");
const logger = require("./utils/logger");

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "store-service" });
});

// routes
app.use("/", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// error handler (last middleware)
app.use(errorHandler);

module.exports = app;
