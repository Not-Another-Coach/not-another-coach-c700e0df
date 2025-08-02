import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface FilterSectionProps {
  onFiltersChange: (filters: any) => void;
}

export const FilterSection = ({ onFiltersChange }: FilterSectionProps) => {
  const [priceRange, setPriceRange] = useState([25, 150]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const specialties = [
    "Weight Loss", "Muscle Building", "Strength Training", "Cardio", 
    "Yoga", "Pilates", "Sports Performance", "Rehabilitation", 
    "Nutrition", "Flexibility", "Endurance", "CrossFit"
  ];

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const clearFilters = () => {
    setPriceRange([25, 150]);
    setSelectedSpecialties([]);
    onFiltersChange({});
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filter Trainers</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Training Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Training Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-sm font-medium mb-2 block">Experience</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2">1-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5-10">5-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
              <SelectItem value="4.0">4.0+ stars</SelectItem>
              <SelectItem value="3.5">3.5+ stars</SelectItem>
              <SelectItem value="3.0">3.0+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Price Range: ${priceRange[0]} - ${priceRange[1]}/hour
          </label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={200}
            min={25}
            step={5}
            className="mt-2"
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="mt-6">
        <label className="text-sm font-medium mb-3 block">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <Badge
              key={specialty}
              variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => toggleSpecialty(specialty)}
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {selectedSpecialties.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">
            Active filters: {selectedSpecialties.length} specialties selected
          </div>
        </div>
      )}
    </div>
  );
};