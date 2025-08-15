import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { Destination } from "@shared/schema";

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const handleExplore = () => {
    // In production, this would navigate to destination details page
    console.log(`Exploring destination: ${destination.name}`);
    alert(`Would navigate to ${destination.name} details page`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`card-destination-${destination.id}`}>
      {destination.imageUrl && (
        <img 
          src={destination.imageUrl} 
          alt={destination.name}
          className="w-full h-48 object-cover"
          data-testid={`img-destination-${destination.id}`}
        />
      )}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-semibold text-gray-900" data-testid={`text-destination-name-${destination.id}`}>
            {destination.name}
          </h4>
          {destination.rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-brand-amber fill-current" />
              <span className="text-sm font-medium" data-testid={`text-destination-rating-${destination.id}`}>
                {destination.rating}
              </span>
            </div>
          )}
        </div>
        
        {destination.description && (
          <p className="text-gray-600 mb-4" data-testid={`text-destination-description-${destination.id}`}>
            {destination.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {destination.startingPrice && (
            <span className="text-brand-orange font-semibold" data-testid={`text-destination-price-${destination.id}`}>
              From ₹{destination.startingPrice.toLocaleString()}
            </span>
          )}
          <Button 
            variant="ghost"
            onClick={handleExplore}
            className="text-brand-blue hover:text-blue-700 font-medium"
            data-testid={`button-explore-destination-${destination.id}`}
          >
            Explore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
