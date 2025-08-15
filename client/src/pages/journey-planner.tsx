import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, type JourneyPlanData } from "@/services/api";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft, Plane, Train, Bus, Hotel } from "lucide-react";
import type { TransportOption, Accommodation, LocalService, SightseeingSpot } from "@shared/schema";

export default function JourneyPlanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<JourneyPlanData>>({
    travelers: 1,
  });

  // Journey plan creation mutation
  const createJourneyPlan = useMutation({
    mutationFn: api.createJourneyPlan,
    onSuccess: () => {
      toast({
        title: "Journey Plan Created",
        description: "Your journey plan has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journey-plans"] });
      setCurrentStep(2);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create journey plan. Please try again.",
        variant: "destructive",
      });
      console.error("Journey plan creation error:", error);
    },
  });

  // Fetch transport options
  const { data: transportOptions, isLoading: transportLoading } = useQuery<TransportOption[]>({
    queryKey: ["/api/transport", formData.sourceLocation, formData.destinationLocation, formData.travelDate],
    enabled: !!(formData.sourceLocation && formData.destinationLocation && currentStep >= 2),
  });

  // Fetch accommodations
  const { data: accommodations, isLoading: accommodationsLoading } = useQuery<Accommodation[]>({
    queryKey: ["/api/accommodations", formData.destinationLocation],
    enabled: !!(formData.destinationLocation && currentStep >= 2),
  });

  // Fetch local services
  const { data: localServices, isLoading: servicesLoading } = useQuery<LocalService[]>({
    queryKey: ["/api/local-services", formData.destinationLocation],
    enabled: !!(formData.destinationLocation && currentStep >= 3),
  });

  // Fetch sightseeing spots
  const { data: sightseeingSpots, isLoading: sightseeingLoading } = useQuery<SightseeingSpot[]>({
    queryKey: ["/api/sightseeing", formData.destinationLocation],
    enabled: !!(formData.destinationLocation && currentStep >= 3),
  });

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sourceLocation || !formData.destinationLocation || !formData.travelDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createJourneyPlan.mutate(formData as JourneyPlanData);
  };

  const renderStepOne = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="text-step1-title">
          <MapPin className="h-5 w-5 text-brand-orange" />
          Step 1: Plan Your Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStepOne} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter departure city"
                  value={formData.sourceLocation || ""}
                  onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                  className="pl-10"
                  required
                  data-testid="input-source-location"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter destination"
                  value={formData.destinationLocation || ""}
                  onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                  className="pl-10"
                  required
                  data-testid="input-destination-location"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.travelDate ? new Date(formData.travelDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setFormData({ ...formData, travelDate: new Date(e.target.value) })}
                  className="pl-10"
                  required
                  data-testid="input-travel-date"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.returnDate ? new Date(formData.returnDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setFormData({ ...formData, returnDate: new Date(e.target.value) })}
                  className="pl-10"
                  data-testid="input-return-date"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.travelers || 1}
                  onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                  className="pl-10"
                  data-testid="input-travelers"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Enter budget in INR"
                  value={formData.budget || ""}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                  className="pl-10"
                  data-testid="input-budget"
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-orange hover:bg-orange-600"
            disabled={createJourneyPlan.isPending}
            data-testid="button-start-planning"
          >
            {createJourneyPlan.isPending ? "Creating Plan..." : "Start Planning"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderStepTwo = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-step2-title">
          Step 2: Choose Your Transport & Accommodation
        </h2>
        <p className="text-gray-600" data-testid="text-journey-details">
          Journey: {formData.sourceLocation} → {formData.destinationLocation}
        </p>
      </div>

      <Tabs defaultValue="transport" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transport" data-testid="tab-transport">Transport Options</TabsTrigger>
          <TabsTrigger value="hotels" data-testid="tab-hotels">Hotels & Stays</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transport" className="space-y-4">
          {transportLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : transportOptions?.length ? (
            <div className="grid gap-4">
              {transportOptions.map((option) => (
                <Card key={option.id} className="hover:shadow-md transition-shadow" data-testid={`card-transport-${option.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {option.type === 'flight' && <Plane className="h-8 w-8 text-brand-blue" />}
                        {option.type === 'train' && <Train className="h-8 w-8 text-brand-emerald" />}
                        {option.type === 'bus' && <Bus className="h-8 w-8 text-brand-orange" />}
                        <div>
                          <h3 className="font-semibold capitalize" data-testid={`text-transport-type-${option.id}`}>
                            {option.type} - {option.provider}
                          </h3>
                          <p className="text-sm text-gray-600" data-testid={`text-transport-route-${option.id}`}>
                            {option.sourceLocation} → {option.destinationLocation}
                          </p>
                          {option.duration && (
                            <p className="text-sm text-gray-500">Duration: {Math.floor(option.duration / 60)}h {option.duration % 60}m</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {option.price && (
                          <p className="font-semibold text-lg" data-testid={`text-transport-price-${option.id}`}>
                            ₹{option.price.toLocaleString()}
                          </p>
                        )}
                        <Button size="sm" className="mt-2" data-testid={`button-book-transport-${option.id}`}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500" data-testid="text-no-transport">
                  No transport options available for this route. Please try a different destination.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="hotels" className="space-y-4">
          {accommodationsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-24 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : accommodations?.length ? (
            <div className="grid gap-4">
              {accommodations.map((hotel) => (
                <Card key={hotel.id} className="hover:shadow-md transition-shadow" data-testid={`card-hotel-${hotel.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Hotel className="h-8 w-8 text-brand-emerald" />
                        <div>
                          <h3 className="font-semibold" data-testid={`text-hotel-name-${hotel.id}`}>
                            {hotel.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize" data-testid={`text-hotel-type-${hotel.id}`}>
                            {hotel.type} • {hotel.location}
                          </p>
                          {hotel.rating && (
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="text-brand-amber">★</span>
                              <span className="text-sm font-medium">{hotel.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {hotel.pricePerNight && (
                          <p className="font-semibold text-lg" data-testid={`text-hotel-price-${hotel.id}`}>
                            ₹{hotel.pricePerNight.toLocaleString()}/night
                          </p>
                        )}
                        <Button size="sm" className="mt-2" data-testid={`button-book-hotel-${hotel.id}`}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500" data-testid="text-no-hotels">
                  No accommodations available for this destination. Please try a different location.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          data-testid="button-back-to-step1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(3)}
          className="bg-brand-orange hover:bg-orange-600"
          data-testid="button-continue-to-services"
        >
          Continue to Local Services
        </Button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-step3-title">
          Step 3: Discover Local Services & Attractions
        </h2>
        <p className="text-gray-600" data-testid="text-step3-subtitle">
          Explore what {formData.destinationLocation} has to offer
        </p>
      </div>

      <Tabs defaultValue="services" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services" data-testid="tab-local-services">Local Services</TabsTrigger>
          <TabsTrigger value="sightseeing" data-testid="tab-sightseeing">Sightseeing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="space-y-4">
          {servicesLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : localServices?.length ? (
            <div className="grid gap-4">
              {localServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow" data-testid={`card-service-${service.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold" data-testid={`text-service-name-${service.id}`}>
                          {service.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1" data-testid={`badge-service-type-${service.id}`}>
                          {service.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {service.address && (
                          <p className="text-sm text-gray-600 mt-1" data-testid={`text-service-address-${service.id}`}>
                            {service.address}
                          </p>
                        )}
                        {service.rating && (
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-brand-amber">★</span>
                            <span className="text-sm font-medium">{service.rating}</span>
                          </div>
                        )}
                      </div>
                      {service.phoneNumber && (
                        <Button variant="outline" size="sm" data-testid={`button-contact-service-${service.id}`}>
                          Contact
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500" data-testid="text-no-services">
                  No local services available for this destination.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="sightseeing" className="space-y-4">
          {sightseeingLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sightseeingSpots?.length ? (
            <div className="grid gap-4">
              {sightseeingSpots.map((spot) => (
                <Card key={spot.id} className="hover:shadow-md transition-shadow" data-testid={`card-sightseeing-${spot.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold" data-testid={`text-spot-name-${spot.id}`}>
                          {spot.name}
                        </h3>
                        {spot.category && (
                          <Badge variant="outline" className="mt-1" data-testid={`badge-spot-category-${spot.id}`}>
                            {spot.category.toUpperCase()}
                          </Badge>
                        )}
                        {spot.description && (
                          <p className="text-sm text-gray-600 mt-2" data-testid={`text-spot-description-${spot.id}`}>
                            {spot.description}
                          </p>
                        )}
                        {spot.rating && (
                          <div className="flex items-center space-x-1 mt-2">
                            <span className="text-brand-amber">★</span>
                            <span className="text-sm font-medium">{spot.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {spot.entryFee && (
                          <p className="font-medium" data-testid={`text-spot-fee-${spot.id}`}>
                            Entry: ₹{spot.entryFee}
                          </p>
                        )}
                        <Button variant="outline" size="sm" className="mt-2" data-testid={`button-visit-spot-${spot.id}`}>
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500" data-testid="text-no-sightseeing">
                  No sightseeing spots available for this destination.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          data-testid="button-back-to-step2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/")}
          className="bg-brand-emerald hover:bg-emerald-600"
          data-testid="button-complete-journey"
        >
          Complete Journey Planning
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-brand-orange text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  data-testid={`step-indicator-${step}`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div 
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-brand-orange' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}
      </div>

      <Footer />
    </div>
  );
}
