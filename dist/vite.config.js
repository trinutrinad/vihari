"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
function getRuntimeDir() {
    try {
        const maybeDir = eval("typeof import !== 'undefined' && import.meta && import.meta.dirname ? import.meta.dirname : undefined");
        if (typeof maybeDir === "string")
            return maybeDir;
    }
    catch { }
    return process.cwd();
}
const runtimeDir = getRuntimeDir();
const plugins = [(0, plugin_react_1.default)()];
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
        const cartographerPkg = require("@replit/vite-plugin-cartographer");
        const cartographer = cartographerPkg?.cartographer ?? cartographerPkg;
        if (typeof cartographer === "function") {
            plugins.push(cartographer());
        }
    }
    catch (err) {
    }
}
exports.default = (0, vite_1.defineConfig)({
    plugins,
    resolve: {
        alias: {
            "@": path_1.default.resolve(runtimeDir, "client", "src"),
            "@shared": path_1.default.resolve(runtimeDir, "shared"),
            "@assets": path_1.default.resolve(runtimeDir, "attached_assets"),
        },
    },
    root: path_1.default.resolve(runtimeDir, "client"),
    build: {
        outDir: path_1.default.resolve(runtimeDir, "dist/public"),
    },
    server: {
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
});
