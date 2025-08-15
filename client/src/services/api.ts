import { apiRequest } from "@/lib/queryClient";

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

export interface JourneyPlanData {
  sourceLocation: string;
  destinationLocation: string;
  travelDate: Date;
  returnDate?: Date;
  travelers?: number;
  budget?: number;
  preferences?: any;
}

export const api = {
  // Destinations
  getDestinations: () => 
    apiRequest("GET", "/api/destinations"),
  
  getFeaturedDestinations: () =>
    apiRequest("GET", "/api/destinations/featured"),
  
  searchDestinations: (query: string) =>
    apiRequest("GET", `/api/destinations/search?q=${encodeURIComponent(query)}`),
  
  getDestination: (id: string) =>
    apiRequest("GET", `/api/destinations/${id}`),

  // Journey Plans
  getJourneyPlans: () =>
    apiRequest("GET", "/api/journey-plans"),
  
  createJourneyPlan: (data: JourneyPlanData) =>
    apiRequest("POST", "/api/journey-plans", data),
  
  getJourneyPlan: (id: string) =>
    apiRequest("GET", `/api/journey-plans/${id}`),
  
  updateJourneyPlan: (id: string, data: Partial<JourneyPlanData>) =>
    apiRequest("PUT", `/api/journey-plans/${id}`, data),
  
  deleteJourneyPlan: (id: string) =>
    apiRequest("DELETE", `/api/journey-plans/${id}`),

  // Transport
  getTransportOptions: (source: string, destination: string, date?: string) => {
    const params = new URLSearchParams({ source, destination });
    if (date) params.append("date", date);
    return apiRequest("GET", `/api/transport?${params}`);
  },

  // Accommodations
  getAccommodations: (location: string) =>
    apiRequest("GET", `/api/accommodations?location=${encodeURIComponent(location)}`),
  
  getAccommodation: (id: string) =>
    apiRequest("GET", `/api/accommodations/${id}`),

  // Local Services
  getLocalServices: (location: string, type?: string) => {
    const params = new URLSearchParams({ location });
    if (type) params.append("type", type);
    return apiRequest("GET", `/api/local-services?${params}`);
  },
  
  getNearbyServices: (lat: number, lng: number, type?: string) => {
    const params = new URLSearchParams({ 
      lat: lat.toString(), 
      lng: lng.toString() 
    });
    if (type) params.append("type", type);
    return apiRequest("GET", `/api/local-services?${params}`);
  },

  // Sightseeing
  getSightseeingSpots: (location: string) =>
    apiRequest("GET", `/api/sightseeing?location=${encodeURIComponent(location)}`),
  
  getNearbySightseeing: (lat: number, lng: number) =>
    apiRequest("GET", `/api/sightseeing?lat=${lat}&lng=${lng}`),

  // Currency
  convertCurrency: async (from: string, to: string, amount: number): Promise<CurrencyConversion> => {
    const response = await apiRequest("GET", `/api/currency/convert?from=${from}&to=${to}&amount=${amount}`);
    return response.json();
  },
};
