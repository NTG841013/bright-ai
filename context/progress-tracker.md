# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation

## Current Goal

- Implement 03-auth.md: Clerk auth wiring — ClerkProvider, proxy.ts, sign-in/sign-up pages, route protection, UserButton.

## Completed

- Design system (01-design-system.md): shadcn/ui components (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea, Tooltip), lucide-react, lib/utils.ts cn() helper, globals.css dark theme variables — all installed and build verified.
- Editor chrome (02-editor.md): EditorNavbar (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose) and ProjectSidebar (floating overlay, Tabs for My Projects/Shared, New Project button) — compiled and type-checked.
- Auth (03-auth.md): @clerk/ui installed; proxy.ts with clerkMiddleware + createRouteMatcher (protects all routes except /sign-in and /sign-up); ClerkProvider with dark theme from @clerk/ui/themes wraps root layout; sign-in and sign-up pages with two-panel desktop layout (logo/tagline/feature list left, Clerk form right), form-only on mobile; / redirects authenticated users to /editor and unauthenticated to /sign-in; UserButton added to EditorNavbar right section.

## In Progress

- None.

## Next Up

- 04: next planned feature unit.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- shadcn uses base-nova style variant with base-ui primitives (not radix).
- Tailwind v4 @theme inline used to map CSS vars to utility color tokens.
- lib/utils.ts cn() uses clsx + tailwind-merge (both already in dependencies).
