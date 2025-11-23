import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CoachRecruitmentSectionProps {
  onBecomeCoach?: () => void;
}

export const CoachRecruitmentSection = ({ onBecomeCoach }: CoachRecruitmentSectionProps) => {
  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
      <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Are You a Coach? Grow Your Business With Us
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join the platform that connects you with serious clients and helps you build the coaching business you've always wanted.
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/auth">
              Become Not Another Coach Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Key stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Growing</div>
              <div className="text-sm text-muted-foreground">Coach Network</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">Your Rate</div>
              <div className="text-sm text-muted-foreground">You Set Prices</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">Secure</div>
              <div className="text-sm text-muted-foreground">Payments</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};