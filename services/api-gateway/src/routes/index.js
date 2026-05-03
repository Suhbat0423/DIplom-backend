const express = require("express");
const serviceMap = require("../proxy/service-map");
const createServiceProxy = require("../proxy/create-service-proxy");

const router = express.Router();

for (const service of serviceMap) {
  router.use(
    service.mountPath,
    createServiceProxy(
      service.target,
      service.mountPath,
      service.upstreamPath,
    ),
  );
}

module.exports = router;
