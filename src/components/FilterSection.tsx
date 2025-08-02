import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, X, MapPin, Star, Clock, DollarSign, Target, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSectionProps {
  onFiltersChange: (filters: any) => void;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  category: string;
}

export const FilterSection = ({ onFiltersChange }: FilterSectionProps) => {
  const [priceRange, setPriceRange] = useState([25, 150]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [trainingType, setTrainingType] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(true);
  const [specialtiesOpen, setSpecialtiesOpen] = useState(true);

  const specialties = [
    { id: "weight_loss", label: "Weight Loss", emoji: "🔥" },
    { id: "muscle_building", label: "Muscle Building", emoji: "💪" },
    { id: "strength_training", label: "Strength Training", emoji: "🏋️" },
    { id: "cardio", label: "Cardio", emoji: "❤️" },
    { id: "yoga", label: "Yoga", emoji: "🧘" },
    { id: "pilates", label: "Pilates", emoji: "🤸" },
    { id: "sports_performance", label: "Sports Performance", emoji: "🏆" },
    { id: "rehabilitation", label: "Rehabilitation", emoji: "🩹" },
    { id: "nutrition", label: "Nutrition", emoji: "🥗" },
    { id: "flexibility", label: "Flexibility", emoji: "🤸‍♀️" },
    { id: "endurance", label: "Endurance", emoji: "🏃" },
    { id: "crossfit", label: "CrossFit", emoji: "⚡" }
  ];

  const updateActiveFilters = () => {
    const filters: ActiveFilter[] = [];
    
    if (trainingType) {
      filters.push({
        id: `training_${trainingType}`,
        label: trainingType === "online" ? "Online" : trainingType === "in-person" ? "In-Person" : "Hybrid",
        value: trainingType,
        category: "Training Type"
      });
    }
    
    if (experience) {
      filters.push({
        id: `experience_${experience}`,
        label: `${experience} years`,
        value: experience,
        category: "Experience"
      });
    }
    
    if (rating) {
      filters.push({
        id: `rating_${rating}`,
        label: `${rating}+ stars`,
        value: rating,
        category: "Rating"
      });
    }
    
    if (priceRange[0] !== 25 || priceRange[1] !== 150) {
      filters.push({
        id: "price_range",
        label: `$${priceRange[0]}-${priceRange[1]}/hr`,
        value: `${priceRange[0]}-${priceRange[1]}`,
        category: "Price"
      });
    }
    
    selectedSpecialties.forEach(specialty => {
      const specialtyData = specialties.find(s => s.label === specialty);
      filters.push({
        id: `specialty_${specialty}`,
        label: specialty,
        value: specialty,
        category: "Specialty"
      });
    });
    
    setActiveFilters(filters);
    onFiltersChange({
      trainingType,
      experience,
      rating,
      priceRange,
      selectedSpecialties
    });
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => {
      const updated = prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty];
      return updated;
    });
  };

  const removeFilter = (filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (!filter) return;
    
    if (filter.category === "Training Type") {
      setTrainingType("");
    } else if (filter.category === "Experience") {
      setExperience("");
    } else if (filter.category === "Rating") {
      setRating("");
    } else if (filter.category === "Price") {
      setPriceRange([25, 150]);
    } else if (filter.category === "Specialty") {
      setSelectedSpecialties(prev => prev.filter(s => s !== filter.value));
    }
  };

  const clearAllFilters = () => {
    setPriceRange([25, 150]);
    setSelectedSpecialties([]);
    setTrainingType("");
    setExperience("");
    setRating("");
  };

  // Update active filters whenever any filter changes
  useEffect(() => {
    updateActiveFilters();
  }, [trainingType, experience, rating, priceRange, selectedSpecialties]);

  return (
    <div className="space-y-6 mb-8">
      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Active Filters ({activeFilters.length})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge 
                  key={filter.id}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                  onClick={() => removeFilter(filter.id)}
                >
                  {filter.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Quick Filters */}
        <Card className="overflow-hidden">
          <Collapsible open={quickFiltersOpen} onOpenChange={setQuickFiltersOpen}>
            <CollapsibleTrigger asChild>
              <div className="p-6 pb-0 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Quick Filters</h3>
                    {(trainingType || experience || rating || priceRange[0] !== 25 || priceRange[1] !== 150) && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  {quickFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-accordion-down">
              <CardContent className="pt-2 pb-6 px-6">
                <div className="space-y-4">
                  {/* Training Type */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Training Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["online", "in-person", "hybrid"].map((type) => (
                    <Button
                      key={type}
                      variant={trainingType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrainingType(trainingType === type ? "" : type)}
                      className={`text-xs transition-all ${trainingType === type ? 'ring-2 ring-primary shadow-md' : ''}`}
                    >
                      {type === "online" ? "Online" : type === "in-person" ? "In-Person" : "Hybrid"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Experience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["1-2", "3-5", "5-10", "10+"].map((exp) => (
                    <Button
                      key={exp}
                      variant={experience === exp ? "default" : "outline"}
                      size="sm"
                      onClick={() => setExperience(experience === exp ? "" : exp)}
                      className={`text-xs transition-all ${experience === exp ? 'ring-2 ring-primary shadow-md' : ''}`}
                    >
                      {exp} years
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Minimum Rating
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["4.5", "4.0", "3.5", "3.0"].map((rate) => (
                    <Button
                      key={rate}
                      variant={rating === rate ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRating(rating === rate ? "" : rate)}
                      className={`text-xs transition-all ${rating === rate ? 'ring-2 ring-primary shadow-md' : ''}`}
                    >
                      {rate}+ ⭐
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
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
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Specialties */}
        <Card className="overflow-hidden">
          <Collapsible open={specialtiesOpen} onOpenChange={setSpecialtiesOpen}>
            <CollapsibleTrigger asChild>
              <div className="p-6 pb-0 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Specialties</h3>
                    {selectedSpecialties.length > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        {selectedSpecialties.length} selected
                      </Badge>
                    )}
                  </div>
                  {specialtiesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-accordion-down">
              <CardContent className="pt-2 pb-6 px-6">
                <div className="grid grid-cols-2 gap-2">
                  {specialties.map((specialty) => (
                    <Button
                      key={specialty.id}
                      variant={selectedSpecialties.includes(specialty.label) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSpecialty(specialty.label)}
                      className={`justify-start text-xs h-auto py-2 transition-all ${
                        selectedSpecialties.includes(specialty.label) ? 'ring-2 ring-primary shadow-md' : ''
                      }`}
                    >
                      <span className="mr-2">{specialty.emoji}</span>
                      {specialty.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};