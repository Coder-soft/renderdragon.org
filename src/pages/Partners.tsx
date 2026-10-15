import { Helmet } from "react-helmet-async";
import {
  IconArrowRight,
  IconKey,
  IconUsers,
  IconChartBar,
  IconShieldCheck,
  IconBolt,
  IconWebhook,
  IconVersions,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import { ConsentFieldList } from "@/components/partners/ConsentFieldList";
import { PartnerApplyForm } from "@/components/partners/PartnerApplyForm";

const BENEFITS = [
  {
    icon: IconShieldCheck,
    title: "Sign in with RenderDragon",
    body: "OAuth 2.1 and OpenID Connect. Your users bring their RenderDragon account; you get standard tokens and a public key set to verify them.",
  },
  {
    icon: IconKey,
    title: "Read-only asset API",
    body: "The full catalog — resources, Minecraft icons, sounds, fonts, presets — behind one scoped key. Reads only, never writes.",
  },
  {
    icon: IconUsers,
    title: "Your users, in one place",
    body: "See who signed in through your app, what they agreed to share, and revoke any of them in a click. Only your users, only what they approved.",
  },
  {
    icon: IconChartBar,
    title: "Usage you can act on",
    body: "Sign-ins, active users, calls by endpoint, error rate and latency, live in your dashboard.",
  },
  {
    icon: IconVersions,
    title: "Cheap, consistent caching",
    body: "A catalog version endpoint tells you exactly when the data changed, so you fetch once and stay in sync without polling.",
  },
  {
    icon: IconWebhook,
    title: "Webhooks",
    body: "Signed events when the catalog changes or a user revokes access. Coming to partners first.",
  },
];

const STEPS = [
  {
    title: "Request an invite",
    body: "Tell us what you're building. We review every application by hand — this is an invite-only program.",
  },
  {
    title: "We verify and set you up",
    body: "Once approved you get an OAuth app, a verified badge, and a read-only API key.",
  },
  {
    title: "Add sign-in",
    body: "Drop RenderDragon sign-in into your app. Users approve the exact fields shown on the consent screen.",
  },
  {
    title: "Read the catalog",
    body: "Use your key against the read-only API, cache with the version endpoint, and watch usage in your dashboard.",
  },
];

const FAQ = [
  {
    q: "Who can join?",
    a: "It's invite-only. We work with people and studios we trust and review each application ourselves. There is no self-serve signup.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. It's free for approved partners. There are no tiers — every partner is a verified partner.",
  },
  {
    q: "What data do users share?",
    a: "Only what your app requests, shown field by field on the consent screen — for example an avatar, display name and email, or a user's favourites if your app asks for them. Users can revoke access any time.",
  },
  {
    q: "Can I upload or change assets?",
    a: "No. Partner access is read-only. You can read the catalog and, with a user's consent, their own data — never write to RenderDragon.",
  },
  {
    q: "Are there rate limits?",
    a: "Yes, per key. They're generous enough for real products and shown on your dashboard. Caching with the version endpoint keeps you well under them.",
  },
];

const API_ENDPOINTS = ["GET /all", "GET /categories", "GET /category/:name", "GET /mcicons", "GET /fonts", "GET /__version"];

export default function Partners() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>Partner Program | RenderDragon</title>
        <meta
          name="description"
          content="Invite-only partner program: add Sign in with RenderDragon and read the asset catalog through a read-only API."
        />
      </Helmet>

      <main className="flex-grow pt-24">
        {/* Hero */}
        <section className="container mx-auto px-4 pb-16 pt-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-6 h-auto border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <a href="#apply">
                <span className="mr-2 inline-block size-1.5 rounded-full bg-primary" />
                Invite-only · reviewed by hand
              </a>
            </Button>
            <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Build on RenderDragon
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Give your app RenderDragon sign-in and read the whole asset catalog through one
              read-only API. Everything users share is listed before they approve it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#apply">
                  Request an invite
                  <IconArrowRight data-icon="inline-end" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#api">See the API</a>
              </Button>
            </div>
          </div>

          {/* Honest, functional preview of the consent screen. */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[28px] bg-primary/5 blur-2xl" aria-hidden />
            <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-[var(--radius)] bg-muted font-heading text-lg font-bold text-primary">
                  A
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">Acme Tools</span>
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <IconShieldCheck className="size-3" /> Verified partner
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">wants to use your RenderDragon account</p>
                </div>
              </div>
              <Separator className="my-5" />
              <ConsentFieldList requested={["profile", "email", "favourites:read"]} />
              <Separator className="my-5" />
              <div className="flex gap-3">
                <Button disabled className="flex-1" size="sm">
                  Approve
                </Button>
                <Button disabled variant="outline" className="flex-1" size="sm">
                  Deny
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                An example. Users control this, and can revoke any time.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-border">
          <div className="container mx-auto px-4 py-16">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">What partners get</h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map(({ icon: BenefitIcon, title, body }) => (
                <div key={title} className="flex flex-col gap-3 bg-card p-6">
                  <BenefitIcon className="size-6 text-primary" stroke={1.6} aria-hidden />
                  <h3 className="font-heading text-base font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — genuinely a sequence, so numbering is warranted. */}
        <section className="border-t border-border">
          <div className="container mx-auto px-4 py-16">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">How it works</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-2">
                  <span className="font-mono text-sm text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-base font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* API */}
        <section id="api" className="border-t border-border scroll-mt-24">
          <div className="container mx-auto px-4 py-16 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">The read-only API</h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                One scoped key, signed requests, reads only. Ask for the catalog version first, then
                refresh only when it changes.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <IconBolt className="size-4 text-primary" stroke={1.6} aria-hidden />
                Rate limits and last-used are on your dashboard.
              </p>
            </div>
            <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
              <div className="border-b border-border px-5 py-3 font-mono text-xs text-muted-foreground">
                api.codersoft.xyz
              </div>
              <ul className="divide-y divide-border">
                {API_ENDPOINTS.map((endpoint) => (
                  <li key={endpoint} className="px-5 py-3 font-mono text-sm text-foreground">
                    {endpoint}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border">
          <div className="container mx-auto px-4 py-16">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Questions</h2>
            <Accordion type="single" collapsible className="mt-8 max-w-2xl">
              {FAQ.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left font-sans">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Apply */}
        <section id="apply" className="border-t border-border scroll-mt-24">
          <div className="container mx-auto px-4 py-16">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">Request an invite</h2>
                <p className="mt-4 text-muted-foreground">
                  Tell us who you are and what you're building. If it's a fit, we'll set up your app
                  and API access.
                </p>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-card p-6 sm:p-8">
                <PartnerApplyForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
