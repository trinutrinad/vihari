"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const vite_1 = require("./vite");
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const error_1 = require("./middleware/error");
const logger_1 = require("./logger");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, xss_clean_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 120,
});
app.use(limiter);
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            logger_1.logger.info(logLine);
        }
    });
    next();
});
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/ready", async (req, res) => {
    res.json({ ready: true });
});
(async () => {
    const server = await (0, routes_1.registerRoutes)(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    if (app.get("env") === "development") {
        await (0, vite_1.setupVite)(app, server);
    }
    else {
        (0, vite_1.serveStatic)(app);
    }
    const port = Number(process.env.PORT) || 5000;
    server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
    }, () => {
        logger_1.logger.info(`serving on port ${port}`);
    });
})();
app.use(error_1.errorHandler);
