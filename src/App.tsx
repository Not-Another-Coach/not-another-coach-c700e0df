import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ClientDashboard from "./pages/ClientDashboard";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import ClientSurvey from "./pages/ClientSurvey";
import Discovery from "./pages/Discovery";
import SavedTrainers from "./pages/SavedTrainers";
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerProfileSetup from "./pages/TrainerProfileSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ClientDashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/client-survey" element={<ClientSurvey />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/saved" element={<SavedTrainers />} />
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/profile-setup" element={<TrainerProfileSetup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
