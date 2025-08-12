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
        <h3 className="text-xl font-medium">Accessibility</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>WCAG 2.2 AA baseline. Keyboard-first navigation with visible focus; semantic HTML.</li>
          <li>Icon-only controls must have a visible label or aria-label. No title-only buttons.</li>
          <li>All inputs require id + name + associated label; placeholders are not labels.</li>
          <li>Valid ARIA only: use aria-expanded only on the toggle control with matching aria-controls.</li>
          <li>No nested interactive elements; make an entire card a single link or move secondary actions out.</li>
          <li>Iframes must have meaningful title attributes.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">State, Data, and Networking</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Use dedicated hooks for data (e.g., useXxx hooks). Keep components presentational where possible.</li>
          <li>Use React Query for server data where applicable; cache keys must include all inputs.</li>
          <li>Use the provided safeFetch wrapper or Supabase SDK; never roll raw fetch for Supabase endpoints.</li>
          <li>Validate inputs/outputs at boundaries (Zod recommended) for edge functions and custom fetchers.</li>
          <li>Prefer optimistic UI with proper rollback on failures when safe.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Supabase Usage</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Always rely on RLS for access control; use SECURITY DEFINER functions when needed.</li>
          <li>Storage: user-generated content goes to private buckets (render with short-lived signed URLs).</li>
          <li>No raw SQL in edge functions; use Supabase client methods. Keep search_path stable in DB functions.</li>
          <li>Do not reference auth schema in frontend. Use public profiles table and RPCs as needed.</li>
          <li>Secrets live in Supabase Edge Function secrets, never in the client code.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Profiles data access model (RLS)</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>RLS enforced on public.profiles: users can SELECT/UPDATE/INSERT only their own row; admins have full access.</li>
          <li>Browsing: authenticated users may SELECT published trainer profiles only (user_type = trainer AND profile_published = true).</li>
          <li>Engagement access: clients and trainers can view each other’s profiles when a client_trainer_engagement row exists.</li>
          <li>Frontend: always include user_type='trainer' + profile_published=true when listing coaches; avoid selecting unnecessary columns.</li>
          <li>Never read auth.users from the client; use profiles and RPCs. Treat billing/card fields as private.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Coach availability access model (RLS)</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>No public reads. Remove permissive SELECT on coach_availability_settings.</li>
          <li>Coaches can manage and view their own availability; admins have full access.</li>
          <li>Clients may SELECT a coach’s availability only if either (a) an engagement exists (client_trainer_engagement) or (b) they are on that coach’s active waitlist.</li>
          <li>Frontend: avoid prefetching availability for unaffiliated users; fetch after shortlist/engagement or on waitlist screens.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Diagnostics, Errors, and Logging</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Use DiagnosticsProvider.add for noteworthy events; include source and concise messages.</li>
          <li>Never log PII; redaction covers email/phone/JWT/Bearer but avoid sending sensitive data altogether.</li>
          <li>Use toast notifications for user-visible issues; keep messages actionable.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Security & Privacy</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Validate and sanitize user inputs. Avoid dangerouslySetInnerHTML unless from trusted sources.</li>
          <li>Follow least privilege in DB policies and functions. Avoid SELECT true unless intended public data.</li>
          <li>Use mermaid securityLevel="strict" and validate diagrams before render (already implemented).</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Performance</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Code-split large routes/components. Memoize heavy computations; use useMemo/useCallback thoughtfully.</li>
          <li>Defer non-critical scripts; lazy-load images. Avoid unnecessary re-renders by lifting state appropriately.</li>
          <li>Prefer pagination/infinite queries over loading large datasets.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Testing & Quality</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Unit-test critical logic in hooks and utils. Snapshot-test presentational components when stable.</li>
          <li>Add Playwright smoke tests for headers/CSP/security where feasible.</li>
          <li>Code review checklist: types, RLS, accessibility, design tokens, error handling, and diagnostics.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Accessibility Definition of Done</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>No icon-only controls without a visible name or aria-label.</li>
          <li>No nested interactive elements.</li>
          <li>All inputs have id + name + associated label; aria-describedby for hints/errors.</li>
          <li>Any aria-expanded has a matching aria-controls and toggles visibility.</li>
          <li>All iframes have titles.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-medium">Lint & CI Guardrails</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>eslint-plugin-jsx-a11y: label-has-associated-control, anchor-has-content, aria-props, aria-roles, no-nested-interactive, no-noninteractive-element-interactions.</li>
          <li>Playwright + axe-core smoke tests on key flows. PRs fail on serious/critical violations.</li>
        </ul>
      </section>

      <footer className="text-sm text-muted-foreground">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </footer>
    </article>
  );
};

export default EngineerGuidelines;
