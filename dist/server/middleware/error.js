"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error(err);
    if (res.headersSent)
        return next(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
}
