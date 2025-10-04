import { Target, Dumbbell, Users } from "lucide-react";

export const SimpleHeroSection = () => {
  return (
    <div className="relative min-h-[40vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              Personal Trainer
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Connect with certified trainers who match your goals, location, and fitness level
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Personalized Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              <span className="text-sm font-medium">Certified Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Trusted by 1000+ Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};