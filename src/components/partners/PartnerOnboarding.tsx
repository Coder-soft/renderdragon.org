import { useEffect, useRef, useState } from "react";
import {
  IconLoader2,
  IconArrowRight,
  IconArrowLeft,
  IconCopy,
  IconKey,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  PARTNER_PERMISSIONS,
  resolvePartnerPermissions,
  type PartnerPermissionId,
} from "@/lib/partners/permissions";
import {
  updatePartnerApp,
  completePartnerOnboarding,
  type PartnerApp,
  type PartnerOrg,
} from "@/lib/partners/client";
import { createPartnerKey, type IssuedPartnerKey } from "@/lib/partners/provisioning";

const STEP_TITLES: Record<1 | 2, string> = {
  1: "Set up your app",
  2: "You're all set",
};

/**
 * First-time partner onboarding. Two steps, transitioned with the transitions.dev
 * page side-by-side snippet; the step title swaps with the text-states-swap snippet
 * and the finale is the success-check snippet.
 */
export function PartnerOnboarding({
  app,
  org,
  onComplete,
}: {
  app: PartnerApp;
  org: PartnerOrg;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState(app.name);
  const [description, setDescription] = useState(app.description ?? "");
  const [logoUrl, setLogoUrl] = useState(app.logo_url ?? "");
  const [redirectUris, setRedirectUris] = useState(app.redirect_uris.join("\n"));
  const [permissions, setPermissions] = useState<PartnerPermissionId[]>(
    app.permissions.length ? app.permissions : ["profile"],
  );

  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState<IssuedPartnerKey | null>(null);

  const titleRef = useRef<HTMLSpanElement>(null);
  const checkRef = useRef<HTMLSpanElement>(null);

  const togglePermission = (id: PartnerPermissionId, checked: boolean) => {
    setPermissions((current) =>
      checked ? [...new Set([...current, id])] : current.filter((permission) => permission !== id),
    );
  };

  // Text-states-swap on the step title (skip the no-op first paint).
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const next = STEP_TITLES[step];
    if (el.textContent === next) return;
    const duration =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--text-swap-dur")) || 200;
    el.classList.add("is-exit");
    const timer = window.setTimeout(() => {
      el.textContent = next;
      el.classList.remove("is-exit");
      el.classList.add("is-enter-start");
      void el.offsetHeight; // force reflow so the enter transition runs
      el.classList.remove("is-enter-start");
    }, duration);
    return () => window.clearTimeout(timer);
  }, [step]);

  // Success-check replay when the finale appears.
  useEffect(() => {
    if (step !== 2) return;
    const check = checkRef.current;
    if (!check) return;
    const path = check.querySelector<SVGPathElement>("svg path");
    if (path) {
      const length = Math.ceil(path.getTotalLength());
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    }
    check.setAttribute("data-state", "out");
    void check.offsetWidth; // force reflow so the keyframes restart
    check.setAttribute("data-state", "in");
  }, [step]);

  const goNext = async () => {
    if (!name.trim()) {
      toast.error("Give your app a name first.");
      return;
    }
    setSaving(true);
    try {
      await updatePartnerApp(app.id, {
        name: name.trim(),
        description: description.trim() || null,
        logo_url: logoUrl.trim() || null,
        redirect_uris: redirectUris.split("\n").map((line) => line.trim()).filter(Boolean),
        permissions,
      });
      setStep(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your app.");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setFinishing(true);
    try {
      await completePartnerOnboarding(app.id);
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not finish setup.");
      setFinishing(false);
    }
  };

  const issueKey = async () => {
    setIssuing(true);
    try {
      setIssued(await createPartnerKey("Onboarding"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create a key.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">Step {step} of 2</p>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={finish} disabled={finishing}>
          Skip setup
        </Button>
      </div>

      <h1 className="mt-3 font-heading text-3xl font-bold">
        <span ref={titleRef} className="t-text-swap">
          {STEP_TITLES[1]}
        </span>
      </h1>

      {/* Page side-by-side: exactly two pages, slid between by data-page. */}
      <div
        className="t-page-slide mt-8 min-h-[760px] sm:min-h-[700px]"
        data-page={String(step)}
      >
        {/* Step 1 — app details */}
        <section className="t-page flex flex-col overflow-y-auto pr-1" data-page-id="1">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-name">App name</Label>
              <Input
                id="ob-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Tools"
              />
              <p className="text-xs text-muted-foreground">Shown to users on the consent screen.</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-logo">Logo URL</Label>
              <Input
                id="ob-logo"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://…/logo.png"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-desc">Description</Label>
              <Textarea
                id="ob-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="One line about what your app does."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ob-redirects">Redirect URIs</Label>
              <Textarea
                id="ob-redirects"
                value={redirectUris}
                onChange={(event) => setRedirectUris(event.target.value)}
                rows={3}
                placeholder="https://yourapp.com/auth/callback"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">One per line.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>What your app asks users for</Label>
              <div className="flex flex-col gap-2">
                {PARTNER_PERMISSIONS.map((permission) => {
                  const disabled = permission.required;
                  return (
                    <label
                      key={permission.id}
                      className="flex items-start gap-3 rounded-[var(--radius)] border border-border p-3"
                    >
                      <Checkbox
                        checked={disabled || permissions.includes(permission.id)}
                        disabled={disabled}
                        onCheckedChange={(checked) => togglePermission(permission.id, checked === true)}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {permission.label}
                          {disabled && (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              Required
                            </Badge>
                          )}
                        </span>
                        <span className="block text-xs text-muted-foreground">{permission.summary}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button onClick={goNext} disabled={saving}>
              {saving ? (
                <IconLoader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <IconArrowRight className="size-4" data-icon="inline-end" aria-hidden />
              )}
              Continue
            </Button>
          </div>
        </section>

        {/* Step 2 — finale */}
        <section className="t-page flex flex-col overflow-y-auto pr-1" data-page-id="2">
          <div className="flex flex-col items-center text-center">
            <span className="t-success-check" data-state="out" ref={checkRef} aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" className="size-16 text-primary">
                <path
                  d="M13 25.5 L21 33 L35 16"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="mt-4 font-heading text-xl font-semibold">{name.trim() || app.name} is ready</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {org.name} can now offer Sign in with RenderDragon and read the asset catalog.
            </p>
          </div>

          <dl className="mt-8 flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Client id</dt>
              <dd className="truncate font-mono text-xs">{app.supabase_client_id ?? "Issued by us after review"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Permissions</dt>
              <dd className="text-right">
                {resolvePartnerPermissions(permissions).map((permission) => permission.label).join(", ")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Redirect URIs</dt>
              <dd>{redirectUris.split("\n").filter((line) => line.trim()).length}</dd>
            </div>
          </dl>

          <Separator className="my-6" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <IconKey className="size-4 text-primary" aria-hidden />
              <p className="text-sm font-medium">Your first read-only API key</p>
            </div>
            {issued ? (
              <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-muted p-4">
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs">{issued.secret}</code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      void navigator.clipboard.writeText(issued.secret);
                      toast.success("Secret copied");
                    }}
                    aria-label="Copy secret"
                  >
                    <IconCopy className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Client id <span className="font-mono">{issued.key_id}</span>. The secret is shown once.
                </p>
              </div>
            ) : (
              <Button variant="outline" className="self-start" onClick={issueKey} disabled={issuing}>
                {issuing && <IconLoader2 className="size-4 animate-spin" aria-hidden />}
                Create key
              </Button>
            )}
          </div>

          <div className="mt-auto flex items-center gap-3 pt-8">
            <Button variant="ghost" onClick={() => setStep(1)} disabled={finishing}>
              <IconArrowLeft className="size-4" data-icon="inline-start" aria-hidden />
              Back
            </Button>
            <Button onClick={finish} disabled={finishing}>
              {finishing && <IconLoader2 className="size-4 animate-spin" aria-hidden />}
              Enter dashboard
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
