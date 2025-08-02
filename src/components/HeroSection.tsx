import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Target, Dumbbell } from "lucide-react";

interface HeroSectionProps {
  onSearch: (searchTerm: string, goal: string, location: string) => void;
}

export const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const handleSearch = () => {
    // This would collect the actual form values
    onSearch("", "", "");
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-success overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              Personal Trainer
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Connect with certified trainers who match your goals, location, and fitness level
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search trainers..."
                className="pl-9 h-12 border-0 bg-muted/50"
              />
            </div>
            
            <Select>
              <SelectTrigger className="h-12 border-0 bg-muted/50">
                <Target className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Fitness Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight-loss">Weight Loss</SelectItem>
                <SelectItem value="muscle-building">Muscle Building</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="sports">Sports Performance</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="h-12 border-0 bg-muted/50">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online Training</SelectItem>
                <SelectItem value="local">Local (In-Person)</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              size="lg" 
              variant="hero"
              className="h-12"
              onClick={handleSearch}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Find Trainers
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span>Popular:</span>
            <button className="text-primary hover:underline">Weight Loss</button>
            <span>•</span>
            <button className="text-primary hover:underline">Muscle Building</button>
            <span>•</span>
            <button className="text-primary hover:underline">Online Training</button>
          </div>
        </div>
      </div>
    </div>
  );
};