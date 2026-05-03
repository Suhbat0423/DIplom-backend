const { createProxyMiddleware } = require("http-proxy-middleware");
const logger = require("../utils/logger");

function joinPaths(basePath, requestPath) {
  const normalizedBase = basePath.replace(/\/+$/, "");
  const normalizedRequest =
    !requestPath || requestPath === "/" ? "" : requestPath.replace(/^\/+/, "/");

  return `${normalizedBase}${normalizedRequest}` || "/";
}

function createServiceProxy(target, mountPath, upstreamPath) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: 10000,
    timeout: 10000,
    pathRewrite(path, req) {
      const rewritten = joinPaths(upstreamPath, path);

      logger.info("Gateway proxy rewrite", {
        mountPath,
        originalUrl: req.originalUrl,
        forwardedPath: rewritten,
        target,
      });

      return rewritten;
    },
    on: {
      proxyReq(proxyReq, req) {
        if (!req.body || !Object.keys(req.body).length) {
          return;
        }

        const contentType = proxyReq.getHeader("Content-Type");
        if (!contentType || !String(contentType).includes("application/json")) {
          return;
        }

        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      },
      error(err, req, res) {
        logger.error("Gateway proxy error", {
          path: req.originalUrl,
          target,
          message: err.message,
        });

        if (!res.headersSent) {
          res.status(502).json({
            message: `Upstream service unavailable: ${target}`,
          });
        }
      },
    },
  });
}

module.exports = createServiceProxy;
