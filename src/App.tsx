import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import Login from "./pages/Login";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientConsents from "./pages/patient/PatientConsents";
import PatientAudit from "./pages/patient/PatientAudit";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ConsumerDashboard from "./pages/consumer/ConsumerDashboard";
import RegulatorDashboard from "./pages/regulator/RegulatorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
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
      <Route path="/" element={isAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <Navigate to="/login" replace />} />

      <Route element={<AuthGate><AppShell /></AuthGate>}>
        {/* Patient */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/records" element={<PatientRecords />} />
        <Route path="/patient/consents" element={<PatientConsents />} />
        <Route path="/patient/audit" element={<PatientAudit />} />
        <Route path="/patient/share" element={<PatientDashboard />} />
        <Route path="/patient/identity-keys" element={<PatientDashboard />} />

        {/* Provider */}
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/patients" element={<ProviderDashboard />} />
        <Route path="/provider/requests" element={<ProviderDashboard />} />
        <Route path="/provider/audit" element={<PatientAudit />} />
        <Route path="/provider/integrations" element={<ProviderDashboard />} />

        {/* Consumer */}
        <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
        <Route path="/consumer/patient-search" element={<ConsumerDashboard />} />
        <Route path="/consumer/request-access" element={<ConsumerDashboard />} />
        <Route path="/consumer/retrieve" element={<ConsumerDashboard />} />
        <Route path="/consumer/audit" element={<PatientAudit />} />

        {/* Regulator */}
        <Route path="/regulator/dashboard" element={<RegulatorDashboard />} />
        <Route path="/regulator/audit" element={<PatientAudit />} />
        <Route path="/regulator/compliance" element={<RegulatorDashboard />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/organizations" element={<AdminDashboard />} />
        <Route path="/admin/network" element={<AdminDashboard />} />
        <Route path="/admin/policies" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
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
