import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { FilterSection } from "@/components/FilterSection";
import { TrainerCard, Trainer } from "@/components/TrainerCard";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";
import trainerAlex from "@/assets/trainer-alex.jpg";

const Index = () => {
  // Sample trainer data
  const [trainers] = useState<Trainer[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      specialties: ["Weight Loss", "Strength Training", "Nutrition"],
      rating: 4.9,
      reviews: 127,
      experience: "8 years",
      location: "Downtown",
      hourlyRate: 85,
      image: trainerSarah,
      certifications: ["NASM-CPT", "Precision Nutrition"],
      description: "Passionate about helping clients achieve sustainable weight loss and building strength. Specializes in creating personalized workout plans that fit your lifestyle.",
      availability: "Mon-Fri",
      trainingType: ["In-Person", "Online"]
    },
    {
      id: "2", 
      name: "Mike Rodriguez",
      specialties: ["Muscle Building", "Powerlifting", "Sports Performance"],
      rating: 4.8,
      reviews: 94,
      experience: "12 years",
      location: "Westside",
      hourlyRate: 95,
      image: trainerMike,
      certifications: ["CSCS", "USAPL Coach"],
      description: "Former competitive powerlifter dedicated to helping clients build serious muscle and strength. Expert in progressive overload and advanced training techniques.",
      availability: "All Week",
      trainingType: ["In-Person", "Hybrid"]
    },
    {
      id: "3",
      name: "Emma Chen",
      specialties: ["Yoga", "Flexibility", "Mindfulness", "Rehabilitation"],
      rating: 4.9,
      reviews: 156,
      experience: "6 years", 
      location: "Eastside",
      hourlyRate: 70,
      image: trainerEmma,
      certifications: ["RYT-500", "Corrective Exercise"],
      description: "Certified yoga instructor focusing on mind-body connection, flexibility, and injury prevention. Perfect for beginners and those seeking holistic wellness.",
      availability: "Flexible",
      trainingType: ["Online", "In-Person"]
    },
    {
      id: "4",
      name: "Alex Thompson", 
      specialties: ["CrossFit", "HIIT", "Endurance", "Functional Training"],
      rating: 4.7,
      reviews: 89,
      experience: "5 years",
      location: "Northside",
      hourlyRate: 80,
      image: trainerAlex,
      certifications: ["CrossFit L2", "ACSM-CPT"],
      description: "High-energy trainer specializing in functional movements and metabolic conditioning. Great for those who love challenging, varied workouts.",
      availability: "Evenings",
      trainingType: ["In-Person", "Group"]
    }
  ]);

  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>(trainers);

  const handleSearch = (searchTerm: string, goal: string, location: string) => {
    // This would implement actual search logic
    console.log("Search:", { searchTerm, goal, location });
  };

  const handleFiltersChange = (filters: any) => {
    // This would implement actual filtering logic
    console.log("Filters:", filters);
  };

  const handleViewProfile = (trainerId: string) => {
    console.log("View profile:", trainerId);
    // This would navigate to trainer detail page
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onSearch={handleSearch} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <FilterSection onFiltersChange={handleFiltersChange} />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Featured Personal Trainers</h2>
          <p className="text-muted-foreground">
            Discover certified trainers who can help you reach your fitness goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTrainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
