import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SelectOrg from "./pages/SelectOrg";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import EmergencyAccess from "./pages/EmergencyAccess";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientConsents from "./pages/patient/PatientConsents";
import PatientConsentDetail from "./pages/patient/PatientConsentDetail";
import PatientAudit from "./pages/patient/PatientAudit";
import PatientShare from "./pages/patient/PatientShare";
import PatientIdentityKeys from "./pages/patient/PatientIdentityKeys";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderPatients from "./pages/provider/ProviderPatients";
import ProviderPatientRecords from "./pages/provider/ProviderPatientRecords";
import ProviderRequests from "./pages/provider/ProviderRequests";
import ProviderAudit from "./pages/provider/ProviderAudit";
import ProviderIntegrations from "./pages/provider/ProviderIntegrations";
import ConsumerDashboard from "./pages/consumer/ConsumerDashboard";
import ConsumerPatientSearch from "./pages/consumer/ConsumerPatientSearch";
import ConsumerRequestAccess from "./pages/consumer/ConsumerRequestAccess";
import ConsumerRetrieve from "./pages/consumer/ConsumerRetrieve";
import ConsumerAudit from "./pages/consumer/ConsumerAudit";
import RegulatorDashboard from "./pages/regulator/RegulatorDashboard";
import RegulatorAudit from "./pages/regulator/RegulatorAudit";
import RegulatorCompliance from "./pages/regulator/RegulatorCompliance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminNetwork from "./pages/admin/AdminNetwork";
import AdminPolicies from "./pages/admin/AdminPolicies";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/select-org" element={isAuthenticated ? <SelectOrg /> : <Navigate to="/login" replace />} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <Navigate to="/login" replace />} />

      <Route element={<AuthGate><AppShell /></AuthGate>}>
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/emergency-access" element={<EmergencyAccess />} />

        {/* Patient */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/records" element={<PatientRecords />} />
        <Route path="/patient/consents" element={<PatientConsents />} />
        <Route path="/patient/consents/:policyId" element={<PatientConsentDetail />} />
        <Route path="/patient/audit" element={<PatientAudit />} />
        <Route path="/patient/share" element={<PatientShare />} />
        <Route path="/patient/identity-keys" element={<PatientIdentityKeys />} />

        {/* Provider */}
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/patients" element={<ProviderPatients />} />
        <Route path="/provider/patient/:id/records" element={<ProviderPatientRecords />} />
        <Route path="/provider/requests" element={<ProviderRequests />} />
        <Route path="/provider/audit" element={<ProviderAudit />} />
        <Route path="/provider/integrations" element={<ProviderIntegrations />} />

        {/* Consumer */}
        <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
        <Route path="/consumer/patient-search" element={<ConsumerPatientSearch />} />
        <Route path="/consumer/request-access" element={<ConsumerRequestAccess />} />
        <Route path="/consumer/retrieve" element={<ConsumerRetrieve />} />
        <Route path="/consumer/audit" element={<ConsumerAudit />} />

        {/* Regulator */}
        <Route path="/regulator/dashboard" element={<RegulatorDashboard />} />
        <Route path="/regulator/audit" element={<RegulatorAudit />} />
        <Route path="/regulator/compliance" element={<RegulatorCompliance />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/organizations" element={<AdminOrganizations />} />
        <Route path="/admin/network" element={<AdminNetwork />} />
        <Route path="/admin/policies" element={<AdminPolicies />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
