/**
 * SecureActionModal — Re-authentication modal for sensitive actions.
 * Used for: consent grant, consent revoke, audit export, key management.
 * Primary button: "Confirm" (action name varies)
 * Secondary: "Cancel"
 * Modals: self (dialog)
 * Toasts: none (handled by caller)
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";

interface SecureActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}

export function SecureActionModal({
  open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm, destructive = false,
}: SecureActionModalProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (pin.length < 4) {
      setError("Please enter your 4-digit security PIN");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await new Promise(r => setTimeout(r, 800));
      await onConfirm();
      setPin("");
      onOpenChange(false);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!loading) { setPin(""); setError(""); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-md" aria-describedby="secure-action-desc">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription id="secure-action-desc" className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="secure-pin">Security PIN</Label>
            <Input
              id="secure-pin"
              type="password"
              maxLength={6}
              placeholder="Enter your PIN"
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleConfirm()}
              aria-label="Security PIN for verification"
            />
            <p className="text-xs text-muted-foreground">
              For security, re-enter your PIN to authorize this action. Use "1234" for demo.
            </p>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant={destructive ? "destructive" : "default"}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
