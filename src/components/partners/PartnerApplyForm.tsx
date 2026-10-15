import { useState } from "react";
import { IconLoader2, IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitPartnerRequest } from "@/lib/partners/client";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PartnerApplyForm() {
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!orgName.trim() || !EMAIL.test(contactEmail.trim())) {
      toast.error("Add your organization name and a valid contact email.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPartnerRequest({ org_name: orgName, contact_email: contactEmail, website, use_case: useCase });
      setDone(true);
      toast.success("Request received. We'll be in touch.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-card p-6">
        <p className="font-heading text-lg font-semibold">Request received</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We review every application by hand. If it's a fit, we'll email{" "}
          <span className="text-foreground">{contactEmail}</span> with your app and API access.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="partner-org">Organization or studio</Label>
        <Input
          id="partner-org"
          value={orgName}
          onChange={(event) => setOrgName(event.target.value)}
          placeholder="Acme Tools"
          autoComplete="organization"
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-email">Contact email</Label>
          <Input
            id="partner-email"
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-site">Website</Label>
          <Input
            id="partner-site"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://example.com"
            autoComplete="url"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="partner-use">What are you building?</Label>
        <Textarea
          id="partner-use"
          value={useCase}
          onChange={(event) => setUseCase(event.target.value)}
          placeholder="How you'll use sign-in and the asset API, and who your users are."
          rows={4}
        />
      </div>
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? (
          <IconLoader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <IconSend className="size-4" data-icon="inline-start" aria-hidden />
        )}
        Request an invite
      </Button>
    </form>
  );
}
