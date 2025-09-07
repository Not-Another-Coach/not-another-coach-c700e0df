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
import AuthCallback from "./pages/AuthCallback";
import ClientSurvey from "./pages/ClientSurvey";
import ClientJourney from "./pages/ClientJourney";
import Discovery from "./pages/Discovery";
import SavedTrainers from "./pages/SavedTrainers";
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerProfileSetup from "./pages/TrainerProfileSetup";
import TrainerSettings from "./pages/TrainerSettings";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TrainerProfile } from "./pages/TrainerProfile";
import { Messaging } from "./pages/Messaging";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import { DiagnosticsProvider } from "@/diagnostics/DiagnosticsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AdminDiagnostics from "@/pages/AdminDiagnostics";
import { PaymentManagement } from "./pages/PaymentManagement";

// Admin pages
import UserManagement from "./pages/admin/UserManagement";
import BulkUserUpload from "./pages/admin/BulkUserUpload";
import VerificationManagement from "./pages/admin/VerificationManagement";
import ProfilePublications from "./pages/admin/ProfilePublications";
import KnowledgeBase from "./pages/admin/KnowledgeBase";
import SpecialtyManagement from "./pages/admin/SpecialtyManagement";
import QualificationManagement from "./pages/admin/QualificationManagement";
import SpecialtyAnalytics from "./pages/admin/SpecialtyAnalytics";
import VerificationAnalytics from "./pages/admin/VerificationAnalytics";
import FeedbackBuilder from "./pages/admin/FeedbackBuilder";
import DataCleanup from "./pages/admin/DataCleanup";
import TemplateManagement from "./pages/admin/TemplateManagement";

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
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/my-trainers" element={<MyTrainers />} />
                <Route path="/client-survey" element={<ClientSurvey />} />
                <Route path="/client/journey" element={<ClientJourney />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/saved" element={<SavedTrainers />} />
                <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
                <Route path="/trainer/profile-setup" element={<TrainerProfileSetup />} />
                <Route path="/trainer/settings" element={<TrainerSettings />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/diagnostics" element={<AdminDiagnostics />} />
                
                {/* Admin function pages */}
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/bulk-upload" element={<BulkUserUpload />} />
                <Route path="/admin/verification" element={<VerificationManagement />} />
                <Route path="/admin/publications" element={<ProfilePublications />} />
                <Route path="/admin/knowledge-base" element={<KnowledgeBase />} />
                <Route path="/admin/specialties" element={<SpecialtyManagement />} />
                <Route path="/admin/qualifications" element={<QualificationManagement />} />
                <Route path="/admin/specialty-analytics" element={<SpecialtyAnalytics />} />
                <Route path="/admin/verification-analytics" element={<VerificationAnalytics />} />
                <Route path="/admin/feedback-builder" element={<FeedbackBuilder />} />
                <Route path="/admin/data-cleanup" element={<DataCleanup />} />
                <Route path="/admin/templates" element={<TemplateManagement />} />
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
