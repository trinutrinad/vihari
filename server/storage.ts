import {
  type User,
  type UpsertUser,
  type Destination,
  type InsertDestination,
  type JourneyPlan,
  type InsertJourneyPlan,
  type TransportOption,
  type InsertTransportOption,
  type Accommodation,
  type InsertAccommodation,
  type LocalService,
  type InsertLocalService,
  type SightseeingSpot,
  type InsertSightseeingSpot,
} from "../shared/schema";
import sql from "mssql";
import { randomUUID } from "crypto";

/*
  Robust storage bootstrap:
  - Does NOT start a connection at import-time.
  - Exposes getPool() which attempts to connect on-demand and returns undefined on failure.
  - Attaches pool 'error' handler after successful connect to avoid unhandled 'error' events.
  - Exports in-memory storage instance for fallback.
*/

// ---- config parsing ----
const serverEnv = process.env.DB_SERVER ?? "BTR\\ABSERVERPB";
let server = serverEnv;
let instanceName: string | undefined;
let port: number | undefined;

if (serverEnv.includes("\\")) {
  const [h, inst] = serverEnv.split("\\", 2);
  server = h;
  instanceName = inst;
} else if (serverEnv.includes(",")) {
  const [h, p] = serverEnv.split(",", 2);
  server = h;
  const parsed = parseInt(p, 10);
  if (!Number.isNaN(parsed)) port = parsed;
}

const config: sql.config = {
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
  // some mssql versions accept port at root
  (config as any).port = port;
}

if (process.env.DB_USER) {
  (config as any).user = process.env.DB_USER;
  (config as any).password = process.env.DB_PASSWORD ?? "";
}

// ---- pooled connection helper (lazy + safe) ----
let _pool: sql.ConnectionPool | undefined;
let _connecting: Promise<sql.ConnectionPool | undefined> | undefined;

export async function getPool(): Promise<sql.ConnectionPool | undefined> {
  if (_pool) return _pool;
  if (_connecting) return _connecting;

  _connecting = (async () => {
    try {
      const pool = await new sql.ConnectionPool(config).connect();
      // attach handler to avoid unhandled 'error' events from the pool
      pool.on("error", (err) => {
        console.warn("SQL pool emitted error:", (err as any)?.message ?? err);
      });
      _pool = pool;
      console.log(`✅ Connected to SQL Server: ${serverEnv}/${config.database}`);
      return pool;
    } catch (err) {
      console.warn("⚠️  Database connection failed (falling back to in-memory storage):", (err as any)?.message ?? err);
      return undefined;
    } finally {
      // allow future attempts after this attempt finishes
      _connecting = undefined;
    }
  })();

  return _connecting;
}

// ----------------- In-memory storage implementation -----------------
export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  upsertUser(user: any): Promise<any>;
  getDestinations(): Promise<any[]>;
  getFeaturedDestinations(): Promise<any[]>;
  getDestination(id: string): Promise<any | undefined>;
  createDestination(destination: any): Promise<any>;
  searchDestinations(query: string): Promise<any[]>;
  getJourneyPlans(userId: string): Promise<any[]>;
  getJourneyPlan(id: string): Promise<any | undefined>;
  createJourneyPlan(journeyPlan: any): Promise<any>;
  updateJourneyPlan(id: string, updates: Partial<any>): Promise<any | undefined>;
  deleteJourneyPlan(id: string): Promise<boolean>;
  getTransportOptions(source: string, destination: string, date?: Date): Promise<any[]>;
  createTransportOption(transport: any): Promise<any>;
  getAccommodations(location: string): Promise<any[]>;
  getAccommodation(id: string): Promise<any | undefined>;
  createAccommodation(accommodation: any): Promise<any>;
  getLocalServices(location: string, type?: string): Promise<any[]>;
  getNearbyServices(latitude: number, longitude: number, type?: string): Promise<any[]>;
  createLocalService(service: any): Promise<any>;
  getSightseeingSpots(location: string): Promise<any[]>;
  getNearbySightseeing(latitude: number, longitude: number): Promise<any[]>;
  createSightseeingSpot(spot: any): Promise<any>;
}

function deg2rad(deg: number) { return deg * (Math.PI / 180); }

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class MemStorage implements IStorage {
  private users = new Map<string, any>();
  private destinations = new Map<string, any>();
  private journeyPlans = new Map<string, any>();
  private transportOptions = new Map<string, any>();
  private accommodations = new Map<string, any>();
  private localServices = new Map<string, any>();
  private sightseeingSpots = new Map<string, any>();

  constructor() { this.initializeData(); }

  private initializeData() {
    const samples = [
      {
        id: randomUUID(),
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
        id: randomUUID(),
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

  async getUser(id: string) { return this.users.get(id); }
  async upsertUser(user: any) {
    const id = user.id ?? randomUUID();
    const now = new Date();
    const item = { id, ...user, createdAt: now, updatedAt: now };
    this.users.set(id, item);
    return item;
  }

  async getDestinations() { return Array.from(this.destinations.values()); }
  async getFeaturedDestinations() { return Array.from(this.destinations.values()).filter(d => d.featured); }
  async getDestination(id: string) { return this.destinations.get(id); }
  async createDestination(destination: any) {
    const item = { id: randomUUID(), ...destination, createdAt: new Date() };
    this.destinations.set(item.id, item);
    return item;
  }
  async searchDestinations(q: string) {
    const s = q.toLowerCase();
    return Array.from(this.destinations.values()).filter(d =>
      (d.name ?? "").toLowerCase().includes(s) ||
      (d.description ?? "").toLowerCase().includes(s) ||
      (d.state ?? "").toLowerCase().includes(s)
    );
  }

  async getJourneyPlans(userId: string) { return Array.from(this.journeyPlans.values()).filter(p => p.userId === userId); }
  async getJourneyPlan(id: string) { return this.journeyPlans.get(id); }
  async createJourneyPlan(data: any) { const plan = { id: randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() }; this.journeyPlans.set(plan.id, plan); return plan; }
  async updateJourneyPlan(id: string, updates: Partial<any>) { const existing = this.journeyPlans.get(id); if (!existing) return undefined; const updated = { ...existing, ...updates, updatedAt: new Date() }; this.journeyPlans.set(id, updated); return updated; }
  async deleteJourneyPlan(id: string) { return this.journeyPlans.delete(id); }

  async getTransportOptions(source: string, destination: string) {
    const src = source.toLowerCase(), dest = destination.toLowerCase();
    return Array.from(this.transportOptions.values()).filter(o =>
      (o.sourceLocation ?? "").toLowerCase().includes(src) &&
      (o.destinationLocation ?? "").toLowerCase().includes(dest)
    );
  }
  async createTransportOption(t: any) { const item = { id: randomUUID(), ...t, createdAt: new Date() }; this.transportOptions.set(item.id, item); return item; }

  async getAccommodations(location: string) { const l = location.toLowerCase(); return Array.from(this.accommodations.values()).filter(a => (a.location ?? "").toLowerCase().includes(l)); }
  async getAccommodation(id: string) { return this.accommodations.get(id); }
  async createAccommodation(a: any) { const item = { id: randomUUID(), ...a, createdAt: new Date() }; this.accommodations.set(item.id, item); return item; }

  async getLocalServices(location: string, type?: string) { const l = location.toLowerCase(); return Array.from(this.localServices.values()).filter(s => (s.location ?? "").toLowerCase().includes(l) && (!type || s.type === type)); }
  async getNearbyServices(latitude: number, longitude: number, type?: string) {
    const radiusKm = 10;
    return Array.from(this.localServices.values()).filter(s => {
      if (type && s.type !== type) return false;
      if (!s.latitude || !s.longitude) return false;
      const lat = Number(s.latitude), lon = Number(s.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
      return haversineKm(latitude, longitude, lat, lon) <= radiusKm;
    });
  }
  async createLocalService(s: any) { const item = { id: randomUUID(), ...s, createdAt: new Date() }; this.localServices.set(item.id, item); return item; }

  async getSightseeingSpots(location: string) { const l = location.toLowerCase(); return Array.from(this.sightseeingSpots.values()).filter(s => (s.location ?? "").toLowerCase().includes(l)); }
  async getNearbySightseeing(latitude: number, longitude: number) {
    const radiusKm = 20;
    return Array.from(this.sightseeingSpots.values()).filter(s => {
      if (!s.latitude || !s.longitude) return false;
      const lat = Number(s.latitude), lon = Number(s.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
      return haversineKm(latitude, longitude, lat, lon) <= radiusKm;
    });
  }
  async createSightseeingSpot(s: any) { const item = { id: randomUUID(), ...s, createdAt: new Date() }; this.sightseeingSpots.set(item.id, item); return item; }
}

export const storage = new MemStorage();
