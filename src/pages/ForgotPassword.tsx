/**
 * ForgotPassword — Email reset flow.
 * Primary button: "Send Reset Link"
 * Secondary: "Back to Sign in"
 * States: form, success, error
 * Toasts: none (inline feedback)
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 animate-slide-up">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg trust-gradient flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground">MedChain</span>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>. It will expire in 30 minutes.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Sign in</Button>
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Reset password</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset link.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input id="reset-email" type="email" required placeholder="name@organization.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Send Reset Link
              </Button>
            </form>
            <Link to="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
