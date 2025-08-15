"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = void 0;
exports.getPool = getPool;
const mssql_1 = __importDefault(require("mssql"));
const crypto_1 = require("crypto");
const serverEnv = process.env.DB_SERVER ?? "BTR\\ABSERVERPB";
let server = serverEnv;
let instanceName;
let port;
if (serverEnv.includes("\\")) {
    const [h, inst] = serverEnv.split("\\", 2);
    server = h;
    instanceName = inst;
}
else if (serverEnv.includes(",")) {
    const [h, p] = serverEnv.split(",", 2);
    server = h;
    const parsed = parseInt(p, 10);
    if (!Number.isNaN(parsed))
        port = parsed;
}
const config = {
    server,
    database: process.env.DB_NAME ?? "vihariDB",
    options: {
        trustServerCertificate: true,
        instanceName: instanceName,
        encrypt: process.env.DB_ENCRYPT === "true",
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
};
if (port) {
    config.port = port;
}
if (process.env.DB_USER) {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD ?? "";
}
let _pool;
let _connecting;
async function getPool() {
    if (_pool)
        return _pool;
    if (_connecting)
        return _connecting;
    _connecting = (async () => {
        try {
            const pool = await new mssql_1.default.ConnectionPool(config).connect();
            pool.on("error", (err) => {
                console.warn("SQL pool emitted error:", err?.message ?? err);
            });
            _pool = pool;
            console.log(`✅ Connected to SQL Server: ${serverEnv}/${config.database}`);
            return pool;
        }
        catch (err) {
            console.warn("⚠️  Database connection failed (falling back to in-memory storage):", err?.message ?? err);
            return undefined;
        }
        finally {
            _connecting = undefined;
        }
    })();
    return _connecting;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
class MemStorage {
    constructor() {
        this.users = new Map();
        this.destinations = new Map();
        this.journeyPlans = new Map();
        this.transportOptions = new Map();
        this.accommodations = new Map();
        this.localServices = new Map();
        this.sightseeingSpots = new Map();
        this.initializeData();
    }
    initializeData() {
        const samples = [
            {
                id: (0, crypto_1.randomUUID)(),
                name: "Goa",
                description: "Pristine beaches and beacheside fun",
                imageUrl: null,
                rating: "4.8",
                startingPrice: 5999,
                state: "Goa",
                country: "India",
                latitude: "15.2993",
                longitude: "74.1240",
                featured: true,
                createdAt: new Date(),
            },
            {
                id: (0, crypto_1.randomUUID)(),
                name: "Kerala",
                description: "Backwaters and hill stations",
                imageUrl: null,
                rating: "4.9",
                startingPrice: 7500,
                state: "Kerala",
                country: "India",
                latitude: "10.8505",
                longitude: "76.2711",
                featured: true,
                createdAt: new Date(),
            },
        ];
        samples.forEach(s => this.destinations.set(s.id, s));
    }
    async getUser(id) { return this.users.get(id); }
    async upsertUser(user) {
        const id = user.id ?? (0, crypto_1.randomUUID)();
        const now = new Date();
        const item = { id, ...user, createdAt: now, updatedAt: now };
        this.users.set(id, item);
        return item;
    }
    async getDestinations() { return Array.from(this.destinations.values()); }
    async getFeaturedDestinations() { return Array.from(this.destinations.values()).filter(d => d.featured); }
    async getDestination(id) { return this.destinations.get(id); }
    async createDestination(destination) {
        const item = { id: (0, crypto_1.randomUUID)(), ...destination, createdAt: new Date() };
        this.destinations.set(item.id, item);
        return item;
    }
    async searchDestinations(q) {
        const s = q.toLowerCase();
        return Array.from(this.destinations.values()).filter(d => (d.name ?? "").toLowerCase().includes(s) ||
            (d.description ?? "").toLowerCase().includes(s) ||
            (d.state ?? "").toLowerCase().includes(s));
    }
    async getJourneyPlans(userId) { return Array.from(this.journeyPlans.values()).filter(p => p.userId === userId); }
    async getJourneyPlan(id) { return this.journeyPlans.get(id); }
    async createJourneyPlan(data) { const plan = { id: (0, crypto_1.randomUUID)(), ...data, createdAt: new Date(), updatedAt: new Date() }; this.journeyPlans.set(plan.id, plan); return plan; }
    async updateJourneyPlan(id, updates) { const existing = this.journeyPlans.get(id); if (!existing)
        return undefined; const updated = { ...existing, ...updates, updatedAt: new Date() }; this.journeyPlans.set(id, updated); return updated; }
    async deleteJourneyPlan(id) { return this.journeyPlans.delete(id); }
    async getTransportOptions(source, destination) {
        const src = source.toLowerCase(), dest = destination.toLowerCase();
        return Array.from(this.transportOptions.values()).filter(o => (o.sourceLocation ?? "").toLowerCase().includes(src) &&
            (o.destinationLocation ?? "").toLowerCase().includes(dest));
    }
    async createTransportOption(t) { const item = { id: (0, crypto_1.randomUUID)(), ...t, createdAt: new Date() }; this.transportOptions.set(item.id, item); return item; }
    async getAccommodations(location) { const l = location.toLowerCase(); return Array.from(this.accommodations.values()).filter(a => (a.location ?? "").toLowerCase().includes(l)); }
    async getAccommodation(id) { return this.accommodations.get(id); }
    async createAccommodation(a) { const item = { id: (0, crypto_1.randomUUID)(), ...a, createdAt: new Date() }; this.accommodations.set(item.id, item); return item; }
    async getLocalServices(location, type) { const l = location.toLowerCase(); return Array.from(this.localServices.values()).filter(s => (s.location ?? "").toLowerCase().includes(l) && (!type || s.type === type)); }
    async getNearbyServices(latitude, longitude, type) {
        const radiusKm = 10;
        return Array.from(this.localServices.values()).filter(s => {
            if (type && s.type !== type)
                return false;
            if (!s.latitude || !s.longitude)
                return false;
            const lat = Number(s.latitude), lon = Number(s.longitude);
            if (Number.isNaN(lat) || Number.isNaN(lon))
                return false;
            return haversineKm(latitude, longitude, lat, lon) <= radiusKm;
        });
    }
    async createLocalService(s) { const item = { id: (0, crypto_1.randomUUID)(), ...s, createdAt: new Date() }; this.localServices.set(item.id, item); return item; }
    async getSightseeingSpots(location) { const l = location.toLowerCase(); return Array.from(this.sightseeingSpots.values()).filter(s => (s.location ?? "").toLowerCase().includes(l)); }
    async getNearbySightseeing(latitude, longitude) {
        const radiusKm = 20;
        return Array.from(this.sightseeingSpots.values()).filter(s => {
            if (!s.latitude || !s.longitude)
                return false;
            const lat = Number(s.latitude), lon = Number(s.longitude);
            if (Number.isNaN(lat) || Number.isNaN(lon))
                return false;
            return haversineKm(latitude, longitude, lat, lon) <= radiusKm;
        });
    }
    async createSightseeingSpot(s) { const item = { id: (0, crypto_1.randomUUID)(), ...s, createdAt: new Date() }; this.sightseeingSpots.set(item.id, item); return item; }
}
exports.MemStorage = MemStorage;
exports.storage = new MemStorage();
