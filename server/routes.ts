// Updated imports + tryQuery to use getPool() lazily (no import-time connect)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getPool } from "./storage";
import { randomUUID } from "crypto";
import { z } from "zod";
import sql from "mssql";
import {
  insertDestinationSchema,
  insertJourneyPlanSchema,
  insertTransportOptionSchema,
  insertAccommodationSchema,
  insertLocalServiceSchema,
  insertSightseeingSpotSchema,
} from "../shared/schema";
import { signToken, requireAuth } from "./middleware/auth";

// Mock authentication middleware for development
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.user) {
    req.user = {
      claims: {
        sub: "mock-user-id",
        email: "user@example.com",
        first_name: "Test",
        last_name: "User",
      },
    };
  }
  next();
};

async function tryQuery<T>(fn: (pool: sql.ConnectionPool) => Promise<T>): Promise<T | undefined> {
  try {
    const pool = await getPool();
    if (!pool) return undefined;
    return await fn(pool);
  } catch (err) {
    console.warn("DB query failed, falling back to in-memory storage:", (err as any)?.message ?? err);
    return undefined;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user endpoint for development
  app.get("/api/auth/user", (req, res) => {
    res.json({
      id: "mock-user-id",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Add a simple login route (demo only — validate credentials)
  app.post("/api/auth/login", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    // validate user from storage/db...
    const token = signToken({ sub: "user-id", email });
    res.json({ token });
  });

  // Destinations endpoints - try DB first, fallback to in-memory storage
  app.get("/api/destinations", async (req, res) => {
    try {
      const dbResult = await tryQuery(async (pool) => {
        const result = await pool.request().query("SELECT * FROM Destinations");
        return result.recordset;
      });

      if (dbResult) return res.json(dbResult);

      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get("/api/destinations/featured", async (req, res) => {
    try {
      const dbResult = await tryQuery(async (pool) => {
        const result = await pool.request().query("SELECT * FROM Destinations WHERE featured = 1");
        return result.recordset;
      });

      if (dbResult) return res.json(dbResult);

      const destinations = await storage.getFeaturedDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching featured destinations:", error);
      res.status(500).json({ message: "Failed to fetch featured destinations" });
    }
  });

  app.get("/api/destinations/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }

      const dbResult = await tryQuery(async (pool) => {
        const request = pool.request();
        request.input("q", sql.NVarChar, `%${q}%`);
        const result = await request.query(
          `SELECT * FROM Destinations WHERE name LIKE @q OR description LIKE @q OR state LIKE @q`
        );
        return result.recordset;
      });

      if (dbResult) return res.json(dbResult);

      const destinations = await storage.searchDestinations(q);
      res.json(destinations);
    } catch (error) {
      console.error("Error searching destinations:", error);
      res.status(500).json({ message: "Failed to search destinations" });
    }
  });

  app.get("/api/destinations/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const dbResult = await tryQuery(async (pool) => {
        const result = await pool
          .request()
          .input("id", sql.NVarChar, id)
          .query("SELECT * FROM Destinations WHERE id = @id");
        return result.recordset[0];
      });

      if (dbResult !== undefined) {
        if (!dbResult) return res.status(404).json({ message: "Destination not found" });
        return res.json(dbResult);
      }

      const destination = await storage.getDestination(id);
      if (!destination) return res.status(404).json({ message: "Destination not found" });
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });

  app.post("/api/destinations", async (req, res) => {
    try {
      const validatedData = insertDestinationSchema.parse(req.body);

      // Try DB insert first
      const dbResult = await tryQuery(async (pool) => {
        const id = randomUUID();
        const reqt = pool.request()
          .input("id", sql.NVarChar, id)
          .input("name", sql.NVarChar, validatedData.name)
          .input("description", sql.NVarChar, validatedData.description ?? null)
          .input("imageUrl", sql.NVarChar, validatedData.imageUrl ?? null)
          .input("rating", sql.NVarChar, validatedData.rating ?? null)
          .input("startingPrice", sql.Float, validatedData.startingPrice ?? null)
          .input("state", sql.NVarChar, validatedData.state ?? null)
          .input("country", sql.NVarChar, validatedData.country ?? "India")
          .input("latitude", sql.NVarChar, validatedData.latitude ?? null)
          .input("longitude", sql.NVarChar, validatedData.longitude ?? null)
          .input("featured", sql.Bit, validatedData.featured ? 1 : 0)
          .input("createdAt", sql.DateTime, new Date());
        await reqt.query(
          `INSERT INTO Destinations (id,name,description,imageUrl,rating,startingPrice,state,country,latitude,longitude,featured,createdAt)
           VALUES (@id,@name,@description,@imageUrl,@rating,@startingPrice,@state,@country,@latitude,@longitude,@featured,@createdAt)`
        );

        const inserted = await pool.request().input("id", sql.NVarChar, id).query("SELECT * FROM Destinations WHERE id = @id");
        return inserted.recordset[0];
      });

      if (dbResult) return res.status(201).json(dbResult);

      const destination = await storage.createDestination(validatedData);
      res.status(201).json(destination);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      console.error("Error creating destination:", error);
      res.status(500).json({ message: "Failed to create destination" });
    }
  });

  // Journey planning endpoints (use in-memory storage)
  app.get("/api/journey-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const journeyPlans = await storage.getJourneyPlans(userId);
      res.json(journeyPlans);
    } catch (error) {
      console.error("Error fetching journey plans:", error);
      res.status(500).json({ message: "Failed to fetch journey plans" });
    }
  });

  app.post("/api/journey-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const processedBody = {
        ...req.body,
        travelDate: req.body.travelDate ? new Date(req.body.travelDate) : undefined,
        returnDate: req.body.returnDate ? new Date(req.body.returnDate) : undefined,
      };
      const validatedData = insertJourneyPlanSchema.parse({
        ...processedBody,
        userId,
      });
      const journeyPlan = await storage.createJourneyPlan(validatedData);
      res.status(201).json(journeyPlan);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Journey plan validation error:", error.errors);
        return res.status(400).json({ message: "Invalid journey plan data", errors: error.errors });
      }
      console.error("Error creating journey plan:", error);
      res.status(500).json({ message: "Failed to create journey plan" });
    }
  });

  app.get("/api/journey-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const journeyPlan = await storage.getJourneyPlan(req.params.id);
      if (!journeyPlan) return res.status(404).json({ message: "Journey plan not found" });
      res.json(journeyPlan);
    } catch (error) {
      console.error("Error fetching journey plan:", error);
      res.status(500).json({ message: "Failed to fetch journey plan" });
    }
  });

  app.put("/api/journey-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertJourneyPlanSchema.partial().parse(req.body);
      const journeyPlan = await storage.updateJourneyPlan(req.params.id, validatedData);
      if (!journeyPlan) return res.status(404).json({ message: "Journey plan not found" });
      res.json(journeyPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid journey plan data", errors: error.errors });
      }
      console.error("Error updating journey plan:", error);
      res.status(500).json({ message: "Failed to update journey plan" });
    }
  });

  app.delete("/api/journey-plans/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteJourneyPlan(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Journey plan not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting journey plan:", error);
      res.status(500).json({ message: "Failed to delete journey plan" });
    }
  });

  // Transport, accommodations, local services, sightseeing and currency endpoints remain using in-memory storage
  // (unchanged from prior implementation) — keep existing logic but routed to storage

  // Transport endpoints
  app.get("/api/transport", async (req, res) => {
    try {
      const { source, destination, date } = req.query;
      if (!source || !destination) return res.status(400).json({ message: "Source and destination are required" });
      const travelDate = date ? new Date(date as string) : undefined;
      const options = await storage.getTransportOptions(source as string, destination as string);
      res.json(options);
    } catch (error) {
      console.error("Error fetching transport options:", error);
      res.status(500).json({ message: "Failed to fetch transport options" });
    }
  });

  app.post("/api/transport", async (req, res) => {
    try {
      const validatedData = insertTransportOptionSchema.parse(req.body);
      const transport = await storage.createTransportOption(validatedData);
      res.status(201).json(transport);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid transport data", errors: error.errors });
      console.error("Error creating transport option:", error);
      res.status(500).json({ message: "Failed to create transport option" });
    }
  });

  // Accommodation endpoints
  app.get("/api/accommodations", async (req, res) => {
    try {
      const { location } = req.query;
      if (!location) return res.status(400).json({ message: "Location is required" });
      const accommodations = await storage.getAccommodations(location as string);
      res.json(accommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });

  app.get("/api/accommodations/:id", async (req, res) => {
    try {
      const accommodation = await storage.getAccommodation(req.params.id);
      if (!accommodation) return res.status(404).json({ message: "Accommodation not found" });
      res.json(accommodation);
    } catch (error) {
      console.error("Error fetching accommodation:", error);
      res.status(500).json({ message: "Failed to fetch accommodation" });
    }
  });

  app.post("/api/accommodations", async (req, res) => {
    try {
      const validatedData = insertAccommodationSchema.parse(req.body);
      const accommodation = await storage.createAccommodation(validatedData);
      res.status(201).json(accommodation);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid accommodation data", errors: error.errors });
      console.error("Error creating accommodation:", error);
      res.status(500).json({ message: "Failed to create accommodation" });
    }
  });

  // Local services endpoints
  app.get("/api/local-services", async (req, res) => {
    try {
      const { location, type, lat, lng } = req.query;
      if (lat && lng) {
        const services = await storage.getNearbyServices(parseFloat(lat as string), parseFloat(lng as string), type as string);
        return res.json(services);
      }
      if (location) {
        const services = await storage.getLocalServices(location as string, type as string);
        return res.json(services);
      }
      return res.status(400).json({ message: "Location or coordinates are required" });
    } catch (error) {
      console.error("Error fetching local services:", error);
      res.status(500).json({ message: "Failed to fetch local services" });
    }
  });

  app.post("/api/local-services", async (req, res) => {
    try {
      const validatedData = insertLocalServiceSchema.parse(req.body);
      const service = await storage.createLocalService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      console.error("Error creating local service:", error);
      res.status(500).json({ message: "Failed to create local service" });
    }
  });

  // Sightseeing endpoints
  app.get("/api/sightseeing", async (req, res) => {
    try {
      const { location, lat, lng } = req.query;
      if (lat && lng) {
        const spots = await storage.getNearbySightseeing(parseFloat(lat as string), parseFloat(lng as string));
        return res.json(spots);
      }
      if (location) {
        const spots = await storage.getSightseeingSpots(location as string);
        return res.json(spots);
      }
      return res.status(400).json({ message: "Location or coordinates are required" });
    } catch (error) {
      console.error("Error fetching sightseeing spots:", error);
      res.status(500).json({ message: "Failed to fetch sightseeing spots" });
    }
  });

  app.post("/api/sightseeing", async (req, res) => {
    try {
      const validatedData = insertSightseeingSpotSchema.parse(req.body);
      const spot = await storage.createSightseeingSpot(validatedData);
      res.status(201).json(spot);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid sightseeing spot data", errors: error.errors });
      console.error("Error creating sightseeing spot:", error);
      res.status(500).json({ message: "Failed to create sightseeing spot" });
    }
  });

  // Currency conversion endpoint (unchanged)
  app.get("/api/currency/convert", async (req, res) => {
    try {
      const { from, to, amount } = req.query;
      if (!from || !to || !amount) return res.status(400).json({ message: "From, to, and amount parameters are required" });

      const mockRates: Record<string, number> = {
        USD: 83.5,
        EUR: 90.25,
        GBP: 105.8,
        JPY: 0.56,
        CAD: 61.45,
        AUD: 54.2,
        INR: 1.0,
      };

      const fromRate = mockRates[from as string] || 1;
      const toRate = mockRates[to as string] || 1;
      const convertedAmount = (parseFloat(amount as string) * fromRate) / toRate;

      res.json({
        from,
        to,
        amount: parseFloat(amount as string),
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        rate: fromRate / toRate,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(500).json({ message: "Failed to convert currency" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

