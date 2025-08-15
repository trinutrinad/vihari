import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { MapPin, Calendar, Search, X } from "lucide-react";

interface JourneyPlannerWidgetProps {
  onClose: () => void;
}

export default function JourneyPlannerWidget({ onClose }: JourneyPlannerWidgetProps) {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    travelDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source || !formData.destination || !formData.travelDate) {
      alert("Please fill in all fields");
      return;
    }

    // Navigate to journey planner with pre-filled data
    const params = new URLSearchParams({
      source: formData.source,
      destination: formData.destination,
      date: formData.travelDate,
    });
    
    setLocation(`/journey-planner?${params}`);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600"
        data-testid="button-close-journey-planner"
      >
        <X className="h-4 w-4" />
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter departure city"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="pl-10"
                data-testid="input-journey-source"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="pl-10"
                data-testid="input-journey-destination"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Travel Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="pl-10"
                data-testid="input-journey-date"
              />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit"
          className="w-full mt-6 bg-brand-orange text-white hover:bg-orange-600"
          data-testid="button-search-journey"
        >
          <Search className="mr-2 h-4 w-4" />
          Search Journey Options
        </Button>
      </form>
    </div>
  );
}
