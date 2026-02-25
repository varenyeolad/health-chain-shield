import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/medical";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_ROUTES: Record<UserRole, string> = {
  patient: "/patient/dashboard",
  provider: "/provider/dashboard",
  consumer: "/consumer/dashboard",
  regulator: "/regulator/dashboard",
  admin: "/admin/dashboard",
};

const DEMO_ACCOUNTS: { role: UserRole; label: string; email: string }[] = [
  { role: "patient", label: "Patient", email: "sarah.chen@email.com" },
  { role: "provider", label: "Provider", email: "j.wilson@mercy.org" },
  { role: "consumer", label: "Consumer", email: "l.park@metro.org" },
  { role: "regulator", label: "Regulator", email: "r.hayes@hhs.gov" },
  { role: "admin", label: "Admin", email: "admin@medchain.io" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (role: UserRole) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    login(role);
    navigate(ROLE_ROUTES[role]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = DEMO_ACCOUNTS.find(a => a.email === email);
    handleLogin(account?.role || "patient");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 trust-gradient flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-display font-semibold">MedChain</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-display font-bold leading-tight">
            Your medical data,<br />your control.
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            A patient-centric medical data exchange built on a tamper-evident immutable ledger. 
            Share records securely with full consent transparency.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Records Anchored", value: "24,891" },
              { label: "Active Consents", value: "12,433" },
              { label: "Organizations", value: "67" },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg bg-primary-foreground/10 backdrop-blur p-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">
          © 2026 MedChain Consortium · Privacy-by-design · HIPAA Compliant
        </p>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg trust-gradient flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">MedChain</span>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Access your medical data exchange portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">Demo quick access</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                onClick={() => handleLogin(acc.role)}
                className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors text-left"
              >
                <span className="block">{acc.label}</span>
                <span className="text-[10px] text-muted-foreground">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
