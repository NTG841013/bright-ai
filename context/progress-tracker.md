# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation
- Removed the `sm:max-w-sm` constraint from the base `DialogContent` component in `components/ui/dialog.tsx` to allow full-width and custom-sized modals to work correctly as intended.
- Refined `StarterTemplatesModal` width and card aspect ratios for a more accurate horizontal 3-column layout.
- Fixed runtime error in Starter Templates modal by replacing incorrect Radix Dialog primitives with the project's Base UI-based Dialog components.

## Completed

- Design system (01-design-system.md): shadcn/ui components (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea, Tooltip), lucide-react, lib/utils.ts cn() helper, globals.css dark theme variables — all installed and build verified.
- Editor chrome (02-editor.md): EditorNavbar (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose) and ProjectSidebar (floating overlay, Tabs for My Projects/Shared, New Project button) — compiled and type-checked.
- Auth (03-auth.md): @clerk/ui installed; proxy.ts with clerkMiddleware + createRouteMatcher (protects all routes except /sign-in and /sign-up); ClerkProvider with dark theme from @clerk/ui/themes wraps root layout; sign-in and sign-up pages with two-panel desktop layout (logo/tagline/feature list left, Clerk form right), form-only on mobile; / redirects authenticated users to /editor and unauthenticated to /sign-in; UserButton added to EditorNavbar right section.
- Project dialogs (04-project-dialogs.md): EditorHome with heading/description/New Project button; useProjectDialogs hook (dialog type, form, loading state); Create dialog with live slug preview; Rename dialog with prefilled autofocus input and Enter-to-submit; Delete dialog with destructive confirm; ProjectSidebar renders mock project items with hover rename/delete for owned projects only; mobile backdrop scrim; all wired through EditorShell.
- Prisma setup (05-prisma.md): Multi-file schema in `prisma/models/`; `Project` and `ProjectCollaborator` models with correct relations and indexes; cached Prisma client singleton in `lib/prisma.ts` with Accelerate/Direct branching; build verified.
- Project APIs (06-project-apis.md): REST endpoints for project CRUD (list, create, rename, delete) implemented in `app/api/projects/` and `app/api/projects/[projectId]/`; Clerk `ownerId` and ownership security checks enforced; build verified.
- Editor home wiring (07-wire-editor-home.md): Editor home sidebar and dialogs wired to real project API; server-side data fetching in `app/editor/page.tsx` via `lib/projects.ts` helper; mutations managed by `useProjectActions` hook; room ID preview in create dialog; build verified.
- Database Infrastructure Fix: Resolved missing table error by syncing schema with `prisma db push`; fixed PostgreSQL SSL warning by updating `DATABASE_URL` to use `sslmode=verify-full` in `.env.local`.
- Error Handling Improvement: Updated `useProjectActions` hook to explicitly handle non-2xx API responses; added `error` state and surfaced error messages in project CRUD dialogs.
- Editor Workspace Shell (08-editor-workspace-shell.md): Implemented `/editor/[roomId]` workspace shell with server-side access checks; created `lib/project-access.ts` for identity/access helpers; added `AccessDenied` component; updated `EditorShell`, `EditorNavbar`, and `ProjectSidebar` to support project context, active room highlighting, and placeholder actions; build verified.
- UI Visual Refinement: Updated the workspace shell UI to match the design screenshot, including a grid-patterned canvas background, separate rounded boxes for navbar and sidebars, and a layout-integrated AI Copilot sidebar.
- Layout Polish: Refined the Editor Workspace layout with thicker borders (`1.5px`), consistent `border-border-subtle` coloring, and standardized module alignment for a more "box-like" separated feel.
- Share Dialog (09-share-dialog.md): Implemented collaborator management with Clerk enrichment; added API logic for listing, inviting, and removing collaborators; created `ShareDialog` component with "Copied!" feedback and owner-specific actions; integrated into `EditorNavbar`; refined UI to match the "Share project" design reference with rounded sections and role badges.
- Share Dialog Logic Fix: Updated `ShareDialog` to correctly fetch and display the project owner regardless of the signed-in user's role; corrected total collaborator count in header; added "(You)" indicator for the current user's entry in the access list; refined badge logic to use actual roles from the enriched API response.
- Data Integrity: Standardized email normalization (trim and lowercase) across all collaborator-related APIs and access helpers to prevent case-variant access bypasses.
- UI Correctness: Fixed invalid interactive-in-interactive nesting in `AccessDenied` component by using `buttonVariants` for the `Link` component instead of wrapping it in a `Button`.
- Type Safety: Improved error handling in `ShareDialog` by replacing unsafe `any` catch typings with `unknown` and implementing a safe error message extraction helper.
- Documentation Fixes: Resolved redeclaration errors in `handling-hook-and-component-errors.md` by adding block scopes to switch cases; fixed `fetchRoom` async/await issues in `create-rooms-manually.md`; fixed inconsistent storage key in `multiple-text-editors.md`; fixed invalid `LiveList` generics in `performant-storage-with-selectors.md`.
- Security: Patched a vulnerability in `lib/project-access.ts` where a missing user email could bypass Prisma filters and grant unauthorized access to projects.
- Liveblocks setup (10-liveblocks-setup.md): Configured Presence and UserMeta in `liveblocks.config.ts`; created cached Node client with deterministic color helper in `lib/liveblocks.ts`; implemented `POST /api/liveblocks-auth` with Clerk auth, project access verification, and room management; build verified.
- API Security: Added room ID validation and trimming in `POST /api/liveblocks-auth` to ensure robust input handling before processing; refactored room creation to use `liveblocks.getOrCreateRoom` for atomic existence handling and improved type safety.
- Base collaborative canvas (11-base-canvas.md): Implemented Liveblocks-backed React Flow canvas with shared types, room provider wrapper, and basic canvas foundation (MiniMap, Background, fitView); build verified.
- Shape panel (12-shape-panel.md): Implemented bottom shape panel with draggable shapes (rectangle, diamond, circle, pill, cylinder, hexagon); added drag-and-drop support for creating nodes on the canvas with unique IDs and custom node rendering; build verified.
- Shape Visuals and Layout Fix: Implemented actual SVG shapes (diamond, circle, hexagon, cylinder, pill) in `CanvasNodeComponent`; reduced default shape sizes for better canvas management; fixed layout issue where canvas would be hidden behind sidebars by using relative positioning and flexbox instead of fixed overlays.
- Sidebar Floating Layout and Node Resizing: Re-implemented sidebars as floating overlays with semi-transparent backgrounds and shadows; allowed canvas to extend edge-to-edge behind sidebars; enabled node resizing using the cursor via `NodeResizer`.
- Canvas Security: Implemented robust validation for the drag-and-drop payload in `Canvas` component, including try-catch for JSON parsing and schema validation for node shapes and dimensions.
- Infrastructure Security: Implemented fail-fast validation for `LIVEBLOCKS_SECRET_KEY` in `lib/liveblocks.ts` to prevent startup with missing configuration.
- Type Safety: Removed unnecessary `as any` cast when appending new nodes in `components/editor/canvas.tsx`.
- Node Shape (13-node-shape.md): Replaced placeholder node renderer with proper shape rendering (CSS for rectangle/pill/circle, SVG for diamond/hexagon/cylinder) and added a ghost drag preview; build verified.
- Node Editing (14-node-editing.md): Implemented resizing with subtle handles and inline label editing with double-click textarea overlay; build verified.
- Node Color Toolbar (15-nodes-color-toolbar.md): Implemented a floating color toolbar for selected nodes with 8 predefined color pairs; build verified.
- Edge Behaviour (16-edge-behaviour.md): Custom right-angle edges with arrows, connection handles on all four node sides, and inline edge label editing with pill badges — all implemented and integrated with collaborative flow. Refined edge visibility for better contrast.
- Canvas Ergonomics (17-canvas-ergonomics.md): Added floating control bar for zoom and undo/redo; implemented `useKeyboardShortcuts` hook for canvas actions; removed minimap; build verified.
- Starter Templates (18-starter-template.md): Created template library and import modal with lightweight SVG previews; integrated "Templates" button in navbar to replace canvas with selected template (Microservices, CI/CD, Event-driven); build verified.
- Template UI Refinement: Updated the Starter Templates modal to match the 3-column horizontal design from the goal screenshot; refined card proportions and SVG preview styling for a more premium look; build verified.
- UI Correctness: Fixed invalid interactive-in-interactive nesting in `CanvasControls` component by using the `render` prop on `TooltipTrigger` instead of nesting a `Button` inside it.

## In Progress

- None.

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
