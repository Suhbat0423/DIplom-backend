const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("./lib/cors");
const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(cors);
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "user-service" });
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use(errorHandler);

module.exports = app;
