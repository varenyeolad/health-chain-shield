/**
 * Help — FAQ, contact form, on-chain vs off-chain explanation.
 * Primary button: "Send Message" (contact form)
 * Sections: FAQ accordion, contact form, blockchain explanation
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Send, Loader2, Shield, Database, Lock } from "lucide-react";

const FAQS = [
  { q: "What is Health Chain Shield?", a: "Health Chain Shield is a demonstration of patient-centered record exchange, consent management, and access auditing. This prototype uses simulated data." },
  { q: "What data is stored on the blockchain?", a: "Only metadata (record IDs, timestamps, hashes), consent policies, and audit logs are stored on the immutable ledger. Your actual medical files are stored encrypted off-chain and referenced by a secure URI." },
  { q: "How does consent work?", a: "You grant or revoke access to your records through consent policies. Each policy specifies which organization can access what types of records, for what purpose, and for how long. Every consent action is permanently recorded on the ledger." },
  { q: "Can I revoke access after granting it?", a: "Yes. You can revoke any active consent at any time. Future access will be immediately denied. However, data that has already been downloaded cannot be retrieved — we make this clear during revocation." },
  { q: "What happens in an emergency?", a: "Emergency access can be granted through a special quick-share flow with a short expiration window. All emergency access is prominently flagged in your audit log and may trigger additional oversight review." },
  { q: "How do I know my data hasn't been tampered with?", a: "Every record has a cryptographic hash (fingerprint) stored on the immutable ledger. When anyone retrieves your record, the system automatically verifies the hash matches — if it doesn't, access is blocked and an alert is raised." },
];

export default function Help() {
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    toast({ title: "Message sent", description: "Our support team will respond within 24 hours." });
    setContactName(""); setContactEmail(""); setContactMessage("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Help & Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Find answers to common questions or reach out to our team.</p>
      </div>

      {/* On-chain vs Off-chain */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">How Your Data Is Protected</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Database, title: "Immutable Ledger", desc: "Record metadata, consent policies, and access logs are stored on a tamper-evident distributed ledger. No single party can alter this data." },
            { icon: Lock, title: "Encrypted Off-Chain", desc: "Your actual medical files (images, reports, notes) are encrypted and stored securely off-chain. Only authorized parties with valid consent can decrypt them." },
            { icon: Shield, title: "Verified Anchors", desc: "A cryptographic hash of each file is stored on the ledger. This 'fingerprint' ensures any tampering is immediately detected during retrieval." },
          ].map(item => (
            <div key={item.title} className="rounded-lg border border-border p-4">
              <item.icon className="h-5 w-5 text-primary mb-2" />
              <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
                aria-expanded={openFaq === i}
              >
                <span className="text-sm font-medium text-foreground">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Contact Support</h2>
        <form onSubmit={handleContact} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" required value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-msg">Message</Label>
            <Textarea id="contact-msg" required rows={4} value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder="Describe your issue or question…" />
          </div>
          <Button type="submit" disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />} Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
