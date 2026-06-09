import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(express.json());

const AI_SERVICE = process.env.AI_SERVICE_URL || "http://ai-service:4000";
const DOCUMENT_SERVICE = process.env.DOCUMENT_SERVICE_URL || "http://document-service:4000";
const CONVERSION_SERVICE = process.env.CONVERSION_SERVICE_URL || "http://conversion-service:4000";

// AI routes
app.use(
  "/ai",
  createProxyMiddleware({ target: AI_SERVICE, changeOrigin: true })
);

// Document routes
app.use(
  "/documents",
  createProxyMiddleware({ target: DOCUMENT_SERVICE, changeOrigin: true })
);

// Conversion routes
app.use(
  "/convert",
  createProxyMiddleware({ target: CONVERSION_SERVICE, changeOrigin: true })
);

app.get("/health", (req, res) => {
  res.json({ status: "gateway ok" });
});

app.listen(8080, () => {
  console.log("API Gateway running on port 8080");
});
