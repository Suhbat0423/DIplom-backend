const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("./lib/cors");
const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");
const serviceMap = require("./proxy/service-map");

const app = express();

app.use(helmet());
app.use(cors);
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "api-gateway" });
});

app.get("/routes", (req, res) => {
  res.json(
    serviceMap.map((service) => ({
      path: service.mountPath,
      target: service.target,
    })),
  );
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use(errorHandler);

module.exports = app;
