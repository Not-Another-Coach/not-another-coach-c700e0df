import { Toaster } from "@/components/ui/toaster";
import { DevEnvironmentBanner } from "@/components/DevEnvironmentBanner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserIntentProvider } from "@/hooks/useUserIntent";
import { VisibilityConfigProvider } from "@/contexts/VisibilityConfigContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { PlatformAccessGuard } from "@/components/auth/PlatformAccessGuard";
import { SessionNotification } from "@/components/SessionNotification";
import { InactivityHandler } from "@/components/InactivityHandler";
import Home from "./pages/Home";
import ClientDashboard from "./pages/ClientDashboard";
import ClientExplore from "./pages/ClientExplore";
import MyTrainers from "./pages/MyTrainers";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ClientSurvey from "./pages/ClientSurvey";
import ClientJourney from "./pages/ClientJourney";
import SavedTrainers from "./pages/SavedTrainers";
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerDemo from "./pages/TrainerDemo";
import TrainerProfileSetup from "./pages/TrainerProfileSetup";
import TrainerSettings from "./pages/TrainerSettings";
import { TrainerAccessPending } from "./pages/TrainerAccessPending";
import { ClientAccessPending } from "./pages/ClientAccessPending";
import { TrainerHolding } from "./pages/TrainerHolding";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminHighlights } from "./pages/AdminHighlights";
import { TrainerProfile } from "./pages/TrainerProfile";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import { DiagnosticsProvider } from "@/diagnostics/DiagnosticsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AdminDiagnostics from "@/pages/AdminDiagnostics";
import { PaymentManagement } from "./pages/PaymentManagement";
import PlanUpgradeSuccess from "./pages/PlanUpgradeSuccess";
import ClientPayments from "./pages/ClientPayments";

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
import MatchingConfiguration from "./pages/admin/MatchingConfiguration";
import GoalManagement from "./pages/admin/GoalManagement";
import { AdminSystemSettings } from "./pages/AdminSystemSettings";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutes default
      gcTime: 10 * 60 * 1000,          // 10 minutes default
      refetchOnMount: false,           // Don't refetch on component mount
      refetchOnWindowFocus: false,     // Don't refetch when window regains focus
      refetchOnReconnect: false,       // Don't refetch on network reconnect
      retry: 1,                        // Only retry once on failure
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProfileProvider>
        <UserIntentProvider>
          <VisibilityConfigProvider>
            <TooltipProvider>
              <DevEnvironmentBanner />
              <Toaster />
              <Sonner />
              <SessionNotification />
              <InactivityHandler timeoutMinutes={30} warningMinutes={2} />
              <BrowserRouter>
                <DiagnosticsProvider>
                <ErrorBoundary>
                  <PlatformAccessGuard>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/auth/signup/:userType" element={<Auth />} />
                      <Route path="/auth/signup" element={<Auth />} />
                      <Route path="/auth/login" element={<Auth />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      
                      {/* Access pending routes */}
                      <Route path="/trainer/access-pending" element={<TrainerAccessPending />} />
                      <Route path="/client/access-pending" element={<ClientAccessPending />} />
                      <Route path="/trainer/holding" element={<TrainerHolding />} />
                      
                      {/* Client routes */}
                      <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/client/explore" element={<ClientExplore />} />
                <Route path="/client/payments" element={<ClientPayments />} />
                <Route path="/my-trainers" element={<MyTrainers />} />
                <Route path="/client-survey" element={<ClientSurvey />} />
                <Route path="/client/journey" element={<ClientJourney />} />
                <Route path="/saved" element={<SavedTrainers />} />
                <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
                <Route path="/trainer/demo" element={<TrainerDemo />} />
                <Route path="/trainer/profile-setup" element={<TrainerProfileSetup />} />
                <Route path="/trainer/settings" element={<TrainerSettings />} />
                <Route path="/trainer/plan-upgrade-success" element={<PlanUpgradeSuccess />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/highlights" element={<AdminHighlights />} />
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
                <Route path="/admin/system-settings" element={<AdminSystemSettings />} />
                <Route path="/admin/matching-config" element={<MatchingConfiguration />} />
                <Route path="/admin/goals" element={<GoalManagement />} />
                <Route path="/trainer/:trainerId" element={<TrainerProfile />} />
                <Route path="/documentation" element={<Documentation />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="/payment-management" element={<PaymentManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                  </PlatformAccessGuard>
                </ErrorBoundary>
              </DiagnosticsProvider>
            </BrowserRouter>
          </TooltipProvider>
        </VisibilityConfigProvider>
      </UserIntentProvider>
      </UserProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
