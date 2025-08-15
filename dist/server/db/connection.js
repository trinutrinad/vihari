"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
require("dotenv/config");
const msnodesqlv8_1 = __importDefault(require("mssql/msnodesqlv8"));
const config = {
    server: process.env.DB_SERVER || 'BTR\\ABSERVERPB',
    database: process.env.DB_NAME || 'vihariDB',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};
exports.pool = new msnodesqlv8_1.default.ConnectionPool(config)
    .connect()
    .then(conn => {
    console.log(`✅ Connected to SQL Server: ${config.server}/${config.database}`);
    return conn;
})
    .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
});
