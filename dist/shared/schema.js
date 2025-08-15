"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSightseeingSpotSchema = exports.insertLocalServiceSchema = exports.insertAccommodationSchema = exports.insertTransportOptionSchema = exports.insertJourneyPlanSchema = exports.insertDestinationSchema = exports.sightseeingSpots = exports.localServices = exports.accommodations = exports.transportOptions = exports.journeyPlans = exports.destinations = exports.users = exports.sessions = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.destinations = (0, pg_core_1.pgTable)("destinations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    imageUrl: (0, pg_core_1.varchar)("image_url"),
    rating: (0, pg_core_1.decimal)("rating", { precision: 3, scale: 2 }),
    startingPrice: (0, pg_core_1.integer)("starting_price"),
    state: (0, pg_core_1.varchar)("state"),
    country: (0, pg_core_1.varchar)("country").default("India"),
    latitude: (0, pg_core_1.decimal)("latitude", { precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.decimal)("longitude", { precision: 11, scale: 8 }),
    featured: (0, pg_core_1.boolean)("featured").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.journeyPlans = (0, pg_core_1.pgTable)("journey_plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    sourceLocation: (0, pg_core_1.varchar)("source_location").notNull(),
    destinationLocation: (0, pg_core_1.varchar)("destination_location").notNull(),
    travelDate: (0, pg_core_1.timestamp)("travel_date"),
    returnDate: (0, pg_core_1.timestamp)("return_date"),
    travelers: (0, pg_core_1.integer)("travelers").default(1),
    budget: (0, pg_core_1.integer)("budget"),
    preferences: (0, pg_core_1.jsonb)("preferences"),
    status: (0, pg_core_1.varchar)("status").default("draft"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.transportOptions = (0, pg_core_1.pgTable)("transport_options", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    type: (0, pg_core_1.varchar)("type").notNull(),
    provider: (0, pg_core_1.varchar)("provider"),
    sourceLocation: (0, pg_core_1.varchar)("source_location").notNull(),
    destinationLocation: (0, pg_core_1.varchar)("destination_location").notNull(),
    departureTime: (0, pg_core_1.timestamp)("departure_time"),
    arrivalTime: (0, pg_core_1.timestamp)("arrival_time"),
    duration: (0, pg_core_1.integer)("duration"),
    price: (0, pg_core_1.integer)("price"),
    currency: (0, pg_core_1.varchar)("currency").default("INR"),
    availability: (0, pg_core_1.boolean)("availability").default(true),
    bookingUrl: (0, pg_core_1.varchar)("booking_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.accommodations = (0, pg_core_1.pgTable)("accommodations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type"),
    location: (0, pg_core_1.varchar)("location").notNull(),
    description: (0, pg_core_1.text)("description"),
    rating: (0, pg_core_1.decimal)("rating", { precision: 3, scale: 2 }),
    pricePerNight: (0, pg_core_1.integer)("price_per_night"),
    currency: (0, pg_core_1.varchar)("currency").default("INR"),
    amenities: (0, pg_core_1.text)("amenities").array(),
    imageUrls: (0, pg_core_1.text)("image_urls").array(),
    bookingUrl: (0, pg_core_1.varchar)("booking_url"),
    latitude: (0, pg_core_1.decimal)("latitude", { precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.decimal)("longitude", { precision: 11, scale: 8 }),
    availability: (0, pg_core_1.boolean)("availability").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.localServices = (0, pg_core_1.pgTable)("local_services", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(),
    location: (0, pg_core_1.varchar)("location").notNull(),
    address: (0, pg_core_1.text)("address"),
    phoneNumber: (0, pg_core_1.varchar)("phone_number"),
    rating: (0, pg_core_1.decimal)("rating", { precision: 3, scale: 2 }),
    latitude: (0, pg_core_1.decimal)("latitude", { precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.decimal)("longitude", { precision: 11, scale: 8 }),
    openingHours: (0, pg_core_1.jsonb)("opening_hours"),
    serviceDetails: (0, pg_core_1.jsonb)("service_details"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.sightseeingSpots = (0, pg_core_1.pgTable)("sightseeing_spots", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    location: (0, pg_core_1.varchar)("location").notNull(),
    category: (0, pg_core_1.varchar)("category"),
    rating: (0, pg_core_1.decimal)("rating", { precision: 3, scale: 2 }),
    entryFee: (0, pg_core_1.integer)("entry_fee"),
    currency: (0, pg_core_1.varchar)("currency").default("INR"),
    imageUrls: (0, pg_core_1.text)("image_urls").array(),
    latitude: (0, pg_core_1.decimal)("latitude", { precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.decimal)("longitude", { precision: 11, scale: 8 }),
    openingHours: (0, pg_core_1.jsonb)("opening_hours"),
    bestTimeToVisit: (0, pg_core_1.varchar)("best_time_to_visit"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertDestinationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.destinations).omit({
    id: true,
    createdAt: true,
});
exports.insertJourneyPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.journeyPlans).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTransportOptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transportOptions).omit({
    id: true,
    createdAt: true,
});
exports.insertAccommodationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.accommodations).omit({
    id: true,
    createdAt: true,
});
exports.insertLocalServiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.localServices).omit({
    id: true,
    createdAt: true,
});
exports.insertSightseeingSpotSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sightseeingSpots).omit({
    id: true,
    createdAt: true,
});
