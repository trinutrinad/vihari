import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "emerald" | "orange" | "purple";
  onClick: () => void;
}

export default function ServiceCard({ icon, title, description, color, onClick }: ServiceCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-brand-blue",
    emerald: "bg-green-100 text-brand-emerald",
    orange: "bg-orange-100 text-brand-orange",
    purple: "bg-purple-100 text-purple-600",
  };

  const hoverClasses = {
    blue: "text-brand-blue",
    emerald: "text-brand-emerald",
    orange: "text-brand-orange",
    purple: "text-purple-600",
  };

  return (
    <Card 
      className="hover:shadow-xl transition-shadow cursor-pointer"
      onClick={onClick}
      data-testid={`card-service-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>
          {icon}
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`text-service-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {title}
        </h4>
        
        <p className="text-gray-600 text-sm mb-4" data-testid={`text-service-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {description}
        </p>
        
        <div className={`flex items-center font-medium ${hoverClasses[color]}`}>
          <span>Explore</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
