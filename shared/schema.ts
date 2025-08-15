import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Destinations table
export const destinations = pgTable("destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  startingPrice: integer("starting_price"),
  state: varchar("state"),
  country: varchar("country").default("India"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Journey plans table
export const journeyPlans = pgTable("journey_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sourceLocation: varchar("source_location").notNull(),
  destinationLocation: varchar("destination_location").notNull(),
  travelDate: timestamp("travel_date"),
  returnDate: timestamp("return_date"),
  travelers: integer("travelers").default(1),
  budget: integer("budget"),
  preferences: jsonb("preferences"), // transport types, accommodation preferences, etc.
  status: varchar("status").default("draft"), // draft, planned, booked, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transport options table
export const transportOptions = pgTable("transport_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // flight, train, bus
  provider: varchar("provider"),
  sourceLocation: varchar("source_location").notNull(),
  destinationLocation: varchar("destination_location").notNull(),
  departureTime: timestamp("departure_time"),
  arrivalTime: timestamp("arrival_time"),
  duration: integer("duration"), // in minutes
  price: integer("price"),
  currency: varchar("currency").default("INR"),
  availability: boolean("availability").default(true),
  bookingUrl: varchar("booking_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accommodation options table
export const accommodations = pgTable("accommodations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type"), // hotel, homestay, resort, guesthouse
  location: varchar("location").notNull(),
  description: text("description"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  pricePerNight: integer("price_per_night"),
  currency: varchar("currency").default("INR"),
  amenities: text("amenities").array(),
  imageUrls: text("image_urls").array(),
  bookingUrl: varchar("booking_url"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  availability: boolean("availability").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Local services table
export const localServices = pgTable("local_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // atm, currency_exchange, taxi, food_delivery, medical, tourist_info
  location: varchar("location").notNull(),
  address: text("address"),
  phoneNumber: varchar("phone_number"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  openingHours: jsonb("opening_hours"),
  serviceDetails: jsonb("service_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sightseeing spots table
export const sightseeingSpots = pgTable("sightseeing_spots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  location: varchar("location").notNull(),
  category: varchar("category"), // historical, religious, natural, cultural, adventure
  rating: decimal("rating", { precision: 3, scale: 2 }),
  entryFee: integer("entry_fee"),
  currency: varchar("currency").default("INR"),
  imageUrls: text("image_urls").array(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  openingHours: jsonb("opening_hours"),
  bestTimeToVisit: varchar("best_time_to_visit"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
  createdAt: true,
});

export const insertJourneyPlanSchema = createInsertSchema(journeyPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransportOptionSchema = createInsertSchema(transportOptions).omit({
  id: true,
  createdAt: true,
});

export const insertAccommodationSchema = createInsertSchema(accommodations).omit({
  id: true,
  createdAt: true,
});

export const insertLocalServiceSchema = createInsertSchema(localServices).omit({
  id: true,
  createdAt: true,
});

export const insertSightseeingSpotSchema = createInsertSchema(sightseeingSpots).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type JourneyPlan = typeof journeyPlans.$inferSelect;
export type InsertJourneyPlan = z.infer<typeof insertJourneyPlanSchema>;
export type TransportOption = typeof transportOptions.$inferSelect;
export type InsertTransportOption = z.infer<typeof insertTransportOptionSchema>;
export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;
export type LocalService = typeof localServices.$inferSelect;
export type InsertLocalService = z.infer<typeof insertLocalServiceSchema>;
export type SightseeingSpot = typeof sightseeingSpots.$inferSelect;
export type InsertSightseeingSpot = z.infer<typeof insertSightseeingSpotSchema>;
