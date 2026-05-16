# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation

## Current Goal

- Implement 06-data-fetching.md: Server Actions and hooks for project CRUD.

## Completed

- Design system (01-design-system.md): shadcn/ui components (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea, Tooltip), lucide-react, lib/utils.ts cn() helper, globals.css dark theme variables — all installed and build verified.
- Editor chrome (02-editor.md): EditorNavbar (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose) and ProjectSidebar (floating overlay, Tabs for My Projects/Shared, New Project button) — compiled and type-checked.
- Auth (03-auth.md): @clerk/ui installed; proxy.ts with clerkMiddleware + createRouteMatcher (protects all routes except /sign-in and /sign-up); ClerkProvider with dark theme from @clerk/ui/themes wraps root layout; sign-in and sign-up pages with two-panel desktop layout (logo/tagline/feature list left, Clerk form right), form-only on mobile; / redirects authenticated users to /editor and unauthenticated to /sign-in; UserButton added to EditorNavbar right section.
- Project dialogs (04-project-dialogs.md): EditorHome with heading/description/New Project button; useProjectDialogs hook (dialog type, form, loading state); Create dialog with live slug preview; Rename dialog with prefilled autofocus input and Enter-to-submit; Delete dialog with destructive confirm; ProjectSidebar renders mock project items with hover rename/delete for owned projects only; mobile backdrop scrim; all wired through EditorShell.
- Prisma setup (05-prisma.md): Multi-file schema in `prisma/models/`; `Project` and `ProjectCollaborator` models with correct relations and indexes; cached Prisma client singleton in `lib/prisma.ts` with Accelerate/Direct branching; build verified.

## In Progress

- None.

## Next Up

- 06: next planned feature unit.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Used Prisma 7 `prismaSchemaFolder` (default) for multi-file schema management.
- Implemented `lib/prisma.ts` as a singleton to handle both direct PG connections (via `@prisma/adapter-pg`) and Prisma Accelerate.

## Session Notes

- Updated clerk-nextjs-patterns evals to explicitly mention proxy.ts and specific route protection requirements.
- shadcn uses base-nova style variant with base-ui primitives (not radix).
- Tailwind v4 @theme inline used to map CSS vars to utility color tokens.
- lib/utils.ts cn() uses clsx + tailwind-merge (both already in dependencies).
