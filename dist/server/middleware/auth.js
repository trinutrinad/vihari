"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || "dev-secret";
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn: "7d" });
}
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer "))
        return res.status(401).json({ message: "Missing token" });
    const token = auth.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
