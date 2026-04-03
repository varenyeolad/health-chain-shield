import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { PermissionGuard } from "@/components/PermissionGuard";
import { getDefaultRoute } from "@/lib/permissions";
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
import ProviderFhirCenter from "./pages/provider/ProviderFhirCenter";
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
import AdminMetrics from "./pages/admin/AdminMetrics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRoute(user.role)} replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <RoleRedirect /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/select-org" element={isAuthenticated ? <SelectOrg /> : <Navigate to="/login" replace />} />
      <Route path="/" element={isAuthenticated ? <RoleRedirect /> : <Navigate to="/login" replace />} />

      <Route element={<AuthGate><AppShell /></AuthGate>}>
        {/* Global — all roles */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />

        {/* Patient */}
        <Route path="/patient/dashboard" element={<PermissionGuard><PatientDashboard /></PermissionGuard>} />
        <Route path="/patient/records" element={<PermissionGuard><PatientRecords /></PermissionGuard>} />
        <Route path="/patient/consents" element={<PermissionGuard><PatientConsents /></PermissionGuard>} />
        <Route path="/patient/consents/:policyId" element={<PermissionGuard><PatientConsentDetail /></PermissionGuard>} />
        <Route path="/patient/audit" element={<PermissionGuard><PatientAudit /></PermissionGuard>} />
        <Route path="/patient/share" element={<PermissionGuard><PatientShare /></PermissionGuard>} />
        <Route path="/patient/identity-keys" element={<PermissionGuard><PatientIdentityKeys /></PermissionGuard>} />

        {/* Provider */}
        <Route path="/provider/dashboard" element={<PermissionGuard><ProviderDashboard /></PermissionGuard>} />
        <Route path="/provider/patients" element={<PermissionGuard><ProviderPatients /></PermissionGuard>} />
        <Route path="/provider/patient/:id/records" element={<PermissionGuard><ProviderPatientRecords /></PermissionGuard>} />
        <Route path="/provider/requests" element={<PermissionGuard><ProviderRequests /></PermissionGuard>} />
        <Route path="/provider/audit" element={<PermissionGuard><ProviderAudit /></PermissionGuard>} />
        <Route path="/provider/integrations" element={<PermissionGuard><ProviderIntegrations /></PermissionGuard>} />
        <Route path="/provider/fhir" element={<PermissionGuard><ProviderFhirCenter /></PermissionGuard>} />
        <Route path="/emergency-access" element={<PermissionGuard><EmergencyAccess /></PermissionGuard>} />

        {/* Consumer */}
        <Route path="/consumer/dashboard" element={<PermissionGuard><ConsumerDashboard /></PermissionGuard>} />
        <Route path="/consumer/patient-search" element={<PermissionGuard><ConsumerPatientSearch /></PermissionGuard>} />
        <Route path="/consumer/request-access" element={<PermissionGuard><ConsumerRequestAccess /></PermissionGuard>} />
        <Route path="/consumer/retrieve" element={<PermissionGuard><ConsumerRetrieve /></PermissionGuard>} />
        <Route path="/consumer/audit" element={<PermissionGuard><ConsumerAudit /></PermissionGuard>} />

        {/* Regulator */}
        <Route path="/regulator/dashboard" element={<PermissionGuard><RegulatorDashboard /></PermissionGuard>} />
        <Route path="/regulator/audit" element={<PermissionGuard><RegulatorAudit /></PermissionGuard>} />
        <Route path="/regulator/compliance" element={<PermissionGuard><RegulatorCompliance /></PermissionGuard>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<PermissionGuard><AdminDashboard /></PermissionGuard>} />
        <Route path="/admin/organizations" element={<PermissionGuard><AdminOrganizations /></PermissionGuard>} />
        <Route path="/admin/network" element={<PermissionGuard><AdminNetwork /></PermissionGuard>} />
        <Route path="/admin/policies" element={<PermissionGuard><AdminPolicies /></PermissionGuard>} />
        <Route path="/admin/users" element={<PermissionGuard><AdminUsers /></PermissionGuard>} />
        <Route path="/admin/metrics" element={<PermissionGuard><AdminMetrics /></PermissionGuard>} />
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
