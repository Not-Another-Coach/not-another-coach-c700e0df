import React from "react";

export const EngineerGuidelines: React.FC = () => {
  return (
    <article aria-label="Engineer Guidelines" className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Engineer Guidelines</h2>
        <p className="text-muted-foreground">
          Principles and practices for building reliable, secure, and maintainable features in this product.
        </p>
      </header>

      <section>
        <h3 className="text-xl font-medium">Core Principles</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>DRY: Prefer reusable hooks/components over duplication. Extract shared logic early.</li>
          <li>Single Responsibility: Each component/hook does one thing well; keep files focused.</li>
          <li>Composition over inheritance: Build small primitives and compose.</li>
          <li>Type Safety: Use explicit TypeScript types; avoid any. Narrow types aggressively at boundaries.</li>
          <li>Accessibility: Keyboard-first, ARIA where needed, color contrast via the design system.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Design System & UI</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Use Tailwind semantic tokens defined in index.css and tailwind.config.ts. Never hardcode colors.</li>
          <li>Prefer shadcn components with variants. Add new variants instead of ad-hoc classes.</li>
          <li>Responsive by default: use fluid layouts and ensure mobile/desktop parity.</li>
          <li>One H1 per page; use semantic HTML tags (header, main, section, article, nav, aside).</li>
          <li>Images: include descriptive alt text; lazy-load where appropriate.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Stack Adaptation — Vite + React SPA on Supabase</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Auth & data:</strong> Supabase Auth + Row Level Security on every table with PT/client scoping. No service role in the browser. Privileged logic only in Edge Functions.</li>
          <li><strong>No SSR/RSC:</strong> Where docs mention SSR/ISR, use CDN rules + static prebuilds; cache app shell carefully.</li>
          <li><strong>Storage:</strong> Buckets are private by default; serve media via signed URLs with explicit Cache-Control metadata; never hotlink third-party embeds in critical views.</li>
          <li><strong>Contracts:</strong> Generate Supabase types and validate client responses with Zod; keep OpenAPI only for Edge Functions.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Headers, CSP & Caching — enforced at CDN/host (not app)</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Required (HTML/API):</strong> X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, CSP with frame-ancestors "self", correct Content-Type.</li>
          <li><strong>Forbidden:</strong> X-XSS-Protection, X-Frame-Options, Pragma, Expires.</li>
          <li><strong>Caching:</strong> index.html: Cache-Control: no-cache (or no-store for sensitive dashboards). Hashed assets (.js/.css/.woff2): public, max-age=31536000, immutable.</li>
          <li><strong>Verify in CI:</strong> Playwright network assertions against a preview URL to assert headers/MIME/caching.</li>
          <li><strong>CSP starter:</strong> default-src "self"; script-src "self" https://ogpiovfxjxcclptfybrk.supabase.co; style-src "self" "unsafe-inline"; img-src "self" data: blob:; connect-src "self" https://ogpiovfxjxcclptfybrk.supabase.co; frame-ancestors "self";</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Supabase RLS Policy Checklist</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Each table has select/insert/update/delete policies with ownership checks (e.g., auth.uid() IN (pt_id, client_id)).</li>
          <li>Admin bypass only via role claim in JWT; never via public API keys.</li>
          <li>Add negative tests (unauthorised user cannot read/write).</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Edge Functions: Webhooks & Idempotency</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Pattern:</strong> verify signature → INSERT INTO webhook_events(id); on conflict do nothing → process only on first insert; wrap in a transaction; retry with backoff.</li>
          <li>All side effects (emails, payouts, message sends) use idempotency keys and write to a ledger row first.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Onboarding Templates & Publishing</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Builder enforces an a11y schema (headings, button text, link text, ALT text, List-Unsubscribe for emails). Preview runs axe; block publish on serious/critical issues.</li>
          <li>Publishing writes an immutable template version and a consent snapshot (marketing vs service + policy version) into the message/publish ledger at send time.</li>
          <li>Conditional logic evaluated client-side with server validation. Template analytics track usage and completion metrics.</li>
          <li>Bulk operations use idempotent processing with progress tracking and error logging.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Diagnostics (SPA)</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Redaction:</strong> emails, phone numbers, JWTs, non-allow-listed query params.</li>
          <li><strong>Owner mapping:</strong> one src/diagnostics/rules. It's used by the provider & UI.</li>
          <li><strong>Sampling:</strong> 20% in prod with burst override to 100% for 10 minutes on spikes.</li>
          <li><strong>Traceability:</strong> attach trace_id (OTel) + current feature flags to each event.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Performance & Web-vitals</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Collect FCP/LCP/CLS/INP (web vitals) → sample to diagnostics.</li>
          <li>Set budgets in CI (Lighthouse) for LCP &lt; 2.5s, CLS &lt; 0.1, INP &lt; 200ms on median devices.</li>
          <li>Animate transform/opacity only; no SMIL/inline SVG animation.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Testing/CI Matrix (SPA fit)</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>ESLint + jsx-a11y (recommended rules).</li>
          <li>Playwright + axe-core smoke tests on login, onboarding, profile, and checkout; fail on serious/critical.</li>
          <li>Headers & MIME assertions on preview.</li>
          <li>RLS tests (positive/negative) using Supabase test users.</li>
          <li>Contract tests: Zod validation of Edge Function responses + generated Supabase types compile.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Definition of Done — SPA/Supabase Delta</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Headers/CSP/caching verified on preview (not just local).</li>
          <li>RLS present and tested for any new/changed table.</li>
          <li>Ledger writes precede any external side effect; handlers are idempotent.</li>
          <li>Template publish is blocked by a11y violations; template_version + consent_snapshot persisted.</li>
          <li>No PII in diagnostics; events carry trace_id + flags; sampling active.</li>
        </ul>
      </section>

      <footer className="text-sm text-muted-foreground">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </footer>
    </article>
  );
};

export default EngineerGuidelines;