import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SessionNotification } from "@/components/SessionNotification";
import Home from "./pages/Home";
import ClientDashboard from "./pages/ClientDashboard";
import MyTrainers from "./pages/MyTrainers";
import Auth from "./pages/Auth";
import ClientSurvey from "./pages/ClientSurvey";
import ClientJourney from "./pages/ClientJourney";
import Discovery from "./pages/Discovery";
import SavedTrainers from "./pages/SavedTrainers";
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerProfileSetup from "./pages/TrainerProfileSetup";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TrainerProfile } from "./pages/TrainerProfile";
import { Messaging } from "./pages/Messaging";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import { DiagnosticsProvider } from "@/diagnostics/DiagnosticsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AdminDiagnostics from "@/pages/AdminDiagnostics";
import { PaymentManagement } from "./pages/PaymentManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionNotification />
        <BrowserRouter>
          <DiagnosticsProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/my-trainers" element={<MyTrainers />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/client-survey" element={<ClientSurvey />} />
                <Route path="/client/journey" element={<ClientJourney />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/saved" element={<SavedTrainers />} />
                <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
                <Route path="/trainer/profile-setup" element={<TrainerProfileSetup />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/diagnostics" element={<AdminDiagnostics />} />
                <Route path="/trainer/:trainerId" element={<TrainerProfile />} />
                <Route path="/messages/:trainerId?" element={<Messaging />} />
                <Route path="/documentation" element={<Documentation />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="/payment-management" element={<PaymentManagement />} />
                  <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </DiagnosticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
