"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupVite = setupVite;
exports.serveStatic = serveStatic;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
async function setupVite(app, server) {
    if (app.get("env") !== "development")
        return;
    try {
        const { createServer } = require("vite");
        const vite = await createServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    }
    catch (err) {
        console.warn("Vite middleware unavailable:", err?.message ?? err);
    }
}
function serveStatic(app) {
    const staticPath = path_1.default.resolve(process.cwd(), "dist", "public");
    app.use(express_1.default.static(staticPath));
    app.get("*", (_req, res) => res.sendFile(path_1.default.join(staticPath, "index.html")));
}
