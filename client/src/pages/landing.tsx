import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DestinationCard from "@/components/destination-card";
import ServiceCard from "@/components/service-card";
import JourneyPlannerWidget from "@/components/journey-planner-widget";
import CurrencyConverter from "@/components/currency-converter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Plane, Hotel, Car, Camera, CreditCard, ArrowRightLeft, Plus, Info } from "lucide-react";
import type { Destination } from "@shared/schema";

export default function Landing() {
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showJourneyPlanner, setShowJourneyPlanner] = useState(false);

  const { data: featuredDestinations, isLoading: destinationsLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations/featured"],
  });

  const handleQuickAccess = (type: string) => {
    // Mock location for demo - in production, use geolocation API
    const mockLocation = { lat: 19.0760, lng: 72.8777 }; // Mumbai coordinates
    console.log(`Finding nearby ${type} services at:`, mockLocation);
    
    // Here you would implement the actual service discovery
    alert(`Finding nearby ${type} services. This would integrate with Google Places API in production.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenCurrencyConverter={() => setShowCurrencyConverter(true)} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-blue to-blue-600 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4" data-testid="hero-title">
              Discover Incredible India
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8" data-testid="hero-subtitle">
              Plan your perfect journey with flights, hotels, local transport & experiences
            </p>
            
            <Button
              onClick={() => setShowJourneyPlanner(true)}
              className="bg-brand-orange text-white px-8 py-4 text-lg font-semibold hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg"
              data-testid="button-plan-journey"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Plan Your Journey
            </Button>
          </div>

          {/* Journey Planning Widget */}
          {showJourneyPlanner && (
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-gray-900 max-w-4xl mx-auto">
              <JourneyPlannerWidget onClose={() => setShowJourneyPlanner(false)} />
            </div>
          )}
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-destinations-title">
              Popular Destinations
            </h3>
            <p className="text-lg text-gray-600" data-testid="text-destinations-subtitle">
              Explore India's most loved tourist destinations
            </p>
          </div>

          {destinationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-t-xl" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDestinations?.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-services-title">
              Complete Travel Services
            </h3>
            <p className="text-lg text-gray-600" data-testid="text-services-subtitle">
              Everything you need for your Indian adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              icon={<Plane className="text-brand-blue text-xl" />}
              title="Transport"
              description="Flights, trains, buses and intercity travel"
              color="blue"
              onClick={() => setShowJourneyPlanner(true)}
            />
            
            <ServiceCard
              icon={<Hotel className="text-brand-emerald text-xl" />}
              title="Hotels & Stays"
              description="Hotels, homestays, and unique accommodations"
              color="emerald"
              onClick={() => alert("Hotel booking feature - would integrate with booking APIs")}
            />
            
            <ServiceCard
              icon={<Car className="text-brand-orange text-xl" />}
              title="Local Services"
              description="Taxis, bikes, food delivery, and more"
              color="orange"
              onClick={() => handleQuickAccess("local transport")}
            />
            
            <ServiceCard
              icon={<Camera className="text-purple-600 text-xl" />}
              title="Sightseeing"
              description="Top attractions and hidden gems nearby"
              color="purple"
              onClick={() => handleQuickAccess("sightseeing")}
            />
          </div>

          {/* Quick Access Services */}
          <Card className="mt-12">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-quick-access-title">
                Quick Access
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 h-auto hover:bg-gray-50"
                  onClick={() => handleQuickAccess("ATMs")}
                  data-testid="button-find-atms"
                >
                  <CreditCard className="text-brand-blue text-2xl mb-2" />
                  <span className="text-sm font-medium text-gray-700">ATMs</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 h-auto hover:bg-gray-50"
                  onClick={() => setShowCurrencyConverter(true)}
                  data-testid="button-currency-exchange"
                >
                  <ArrowRightLeft className="text-brand-emerald text-2xl mb-2" />
                  <span className="text-sm font-medium text-gray-700">Exchange</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 h-auto hover:bg-gray-50"
                  onClick={() => handleQuickAccess("medical")}
                  data-testid="button-find-medical"
                >
                  <Plus className="text-red-500 text-2xl mb-2" />
                  <span className="text-sm font-medium text-gray-700">Medical</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 h-auto hover:bg-gray-50"
                  onClick={() => handleQuickAccess("tourist info")}
                  data-testid="button-tourist-info"
                >
                  <Info className="text-brand-amber text-2xl mb-2" />
                  <span className="text-sm font-medium text-gray-700">Tourist Info</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Currency Converter Widget */}
      {showCurrencyConverter && (
        <CurrencyConverter onClose={() => setShowCurrencyConverter(false)} />
      )}
    </div>
  );
}
