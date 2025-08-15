import {
  users,
  destinations,
  journeyPlans,
  transportOptions,
  accommodations,
  localServices,
  sightseeingSpots,
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
} from "@shared/schema";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Destination operations
  getDestinations(): Promise<Destination[]>;
  getFeaturedDestinations(): Promise<Destination[]>;
  getDestination(id: string): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  searchDestinations(query: string): Promise<Destination[]>;
  
  // Journey plan operations
  getJourneyPlans(userId: string): Promise<JourneyPlan[]>;
  getJourneyPlan(id: string): Promise<JourneyPlan | undefined>;
  createJourneyPlan(journeyPlan: InsertJourneyPlan): Promise<JourneyPlan>;
  updateJourneyPlan(id: string, updates: Partial<InsertJourneyPlan>): Promise<JourneyPlan | undefined>;
  deleteJourneyPlan(id: string): Promise<boolean>;
  
  // Transport operations
  getTransportOptions(source: string, destination: string, date?: Date): Promise<TransportOption[]>;
  createTransportOption(transport: InsertTransportOption): Promise<TransportOption>;
  
  // Accommodation operations
  getAccommodations(location: string): Promise<Accommodation[]>;
  getAccommodation(id: string): Promise<Accommodation | undefined>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  
  // Local services operations
  getLocalServices(location: string, type?: string): Promise<LocalService[]>;
  getNearbyServices(latitude: number, longitude: number, type?: string): Promise<LocalService[]>;
  createLocalService(service: InsertLocalService): Promise<LocalService>;
  
  // Sightseeing operations
  getSightseeingSpots(location: string): Promise<SightseeingSpot[]>;
  getNearbySightseeing(latitude: number, longitude: number): Promise<SightseeingSpot[]>;
  createSightseeingSpot(spot: InsertSightseeingSpot): Promise<SightseeingSpot>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private destinations: Map<string, Destination> = new Map();
  private journeyPlans: Map<string, JourneyPlan> = new Map();
  private transportOptions: Map<string, TransportOption> = new Map();
  private accommodations: Map<string, Accommodation> = new Map();
  private localServices: Map<string, LocalService> = new Map();
  private sightseeingSpots: Map<string, SightseeingSpot> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample destinations
    const sampleDestinations: Destination[] = [
      {
        id: randomUUID(),
        name: "Goa",
        description: "Pristine beaches, vibrant nightlife, and Portuguese heritage",
        imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
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
        description: "God's Own Country with backwaters, hill stations, and spices",
        imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        rating: "4.9",
        startingPrice: 7500,
        state: "Kerala",
        country: "India",
        latitude: "10.8505",
        longitude: "76.2711",
        featured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Rajasthan",
        description: "Royal palaces, desert safaris, and rich cultural heritage",
        imageUrl: "https://pixabay.com/get/ge8298c0e7cedd769cff120f10e60be8a58882904058f2d980788554332e696167950755f464845561a5d6a3c01eba31dff8fe46c1df95d915bd6586749680cdf_1280.jpg",
        rating: "4.7",
        startingPrice: 6800,
        state: "Rajasthan",
        country: "India",
        latitude: "27.0238",
        longitude: "74.2179",
        featured: true,
        createdAt: new Date(),
      },
    ];

    sampleDestinations.forEach(dest => this.destinations.set(dest.id, dest));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = Array.from(this.users.values()).find(user => user.id === userData.id);
    
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      const newUser: User = {
        id: userData.id || randomUUID(),
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(newUser.id, newUser);
      return newUser;
    }
  }

  // Destination operations
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async getFeaturedDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values()).filter(dest => dest.featured);
  }

  async getDestination(id: string): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }

  async createDestination(destinationData: InsertDestination): Promise<Destination> {
    const destination: Destination = {
      id: randomUUID(),
      ...destinationData,
      createdAt: new Date(),
    };
    this.destinations.set(destination.id, destination);
    return destination;
  }

  async searchDestinations(query: string): Promise<Destination[]> {
    const queryLower = query.toLowerCase();
    return Array.from(this.destinations.values()).filter(dest =>
      dest.name.toLowerCase().includes(queryLower) ||
      dest.description?.toLowerCase().includes(queryLower) ||
      dest.state?.toLowerCase().includes(queryLower)
    );
  }

  // Journey plan operations
  async getJourneyPlans(userId: string): Promise<JourneyPlan[]> {
    return Array.from(this.journeyPlans.values()).filter(plan => plan.userId === userId);
  }

  async getJourneyPlan(id: string): Promise<JourneyPlan | undefined> {
    return this.journeyPlans.get(id);
  }

  async createJourneyPlan(journeyPlanData: InsertJourneyPlan): Promise<JourneyPlan> {
    const journeyPlan: JourneyPlan = {
      id: randomUUID(),
      ...journeyPlanData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.journeyPlans.set(journeyPlan.id, journeyPlan);
    return journeyPlan;
  }

  async updateJourneyPlan(id: string, updates: Partial<InsertJourneyPlan>): Promise<JourneyPlan | undefined> {
    const existing = this.journeyPlans.get(id);
    if (!existing) return undefined;

    const updated: JourneyPlan = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.journeyPlans.set(id, updated);
    return updated;
  }

  async deleteJourneyPlan(id: string): Promise<boolean> {
    return this.journeyPlans.delete(id);
  }

  // Transport operations
  async getTransportOptions(source: string, destination: string, date?: Date): Promise<TransportOption[]> {
    return Array.from(this.transportOptions.values()).filter(option =>
      option.sourceLocation.toLowerCase().includes(source.toLowerCase()) &&
      option.destinationLocation.toLowerCase().includes(destination.toLowerCase())
    );
  }

  async createTransportOption(transportData: InsertTransportOption): Promise<TransportOption> {
    const transport: TransportOption = {
      id: randomUUID(),
      ...transportData,
      createdAt: new Date(),
    };
    this.transportOptions.set(transport.id, transport);
    return transport;
  }

  // Accommodation operations
  async getAccommodations(location: string): Promise<Accommodation[]> {
    const locationLower = location.toLowerCase();
    return Array.from(this.accommodations.values()).filter(acc =>
      acc.location.toLowerCase().includes(locationLower)
    );
  }

  async getAccommodation(id: string): Promise<Accommodation | undefined> {
    return this.accommodations.get(id);
  }

  async createAccommodation(accommodationData: InsertAccommodation): Promise<Accommodation> {
    const accommodation: Accommodation = {
      id: randomUUID(),
      ...accommodationData,
      createdAt: new Date(),
    };
    this.accommodations.set(accommodation.id, accommodation);
    return accommodation;
  }

  // Local services operations
  async getLocalServices(location: string, type?: string): Promise<LocalService[]> {
    const locationLower = location.toLowerCase();
    return Array.from(this.localServices.values()).filter(service => {
      const locationMatch = service.location.toLowerCase().includes(locationLower);
      const typeMatch = !type || service.type === type;
      return locationMatch && typeMatch;
    });
  }

  async getNearbyServices(latitude: number, longitude: number, type?: string): Promise<LocalService[]> {
    // Simple distance calculation - in production, use proper geospatial queries
    return Array.from(this.localServices.values()).filter(service => {
      if (type && service.type !== type) return false;
      if (!service.latitude || !service.longitude) return false;
      
      const lat1 = parseFloat(service.latitude);
      const lon1 = parseFloat(service.longitude);
      const distance = Math.sqrt(Math.pow(lat1 - latitude, 2) + Math.pow(lon1 - longitude, 2));
      return distance < 0.1; // Within ~10km radius
    });
  }

  async createLocalService(serviceData: InsertLocalService): Promise<LocalService> {
    const service: LocalService = {
      id: randomUUID(),
      ...serviceData,
      createdAt: new Date(),
    };
    this.localServices.set(service.id, service);
    return service;
  }

  // Sightseeing operations
  async getSightseeingSpots(location: string): Promise<SightseeingSpot[]> {
    const locationLower = location.toLowerCase();
    return Array.from(this.sightseeingSpots.values()).filter(spot =>
      spot.location.toLowerCase().includes(locationLower)
    );
  }

  async getNearbySightseeing(latitude: number, longitude: number): Promise<SightseeingSpot[]> {
    return Array.from(this.sightseeingSpots.values()).filter(spot => {
      if (!spot.latitude || !spot.longitude) return false;
      
      const lat1 = parseFloat(spot.latitude);
      const lon1 = parseFloat(spot.longitude);
      const distance = Math.sqrt(Math.pow(lat1 - latitude, 2) + Math.pow(lon1 - longitude, 2));
      return distance < 0.2; // Within ~20km radius
    });
  }

  async createSightseeingSpot(spotData: InsertSightseeingSpot): Promise<SightseeingSpot> {
    const spot: SightseeingSpot = {
      id: randomUUID(),
      ...spotData,
      createdAt: new Date(),
    };
    this.sightseeingSpots.set(spot.id, spot);
    return spot;
  }
}

export const storage = new MemStorage();
