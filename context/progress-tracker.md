# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 2: AI Integration
- AI Infrastructure: Configuring durable background tasks for AI generation.

## Completed

- Design system (01-design-system.md): shadcn/ui and Tailwind v4 setup; build verified.
- Editor chrome (02-editor.md): EditorNavbar and ProjectSidebar; build verified.
- Auth (03-auth.md): Clerk integration and route protection; build verified.
- Project dialogs (04-project-dialogs.md): CRUD dialogs (Create, Rename, Delete) with live preview; build verified.
- Prisma setup (05-prisma.md): Multi-file schema and singleton client; build verified.
- Project APIs (06-project-apis.md): REST endpoints for project CRUD; build verified.
- Editor home wiring (07-wire-editor-home.md): Wired sidebar and dialogs to real project API; build verified.
- Editor Workspace Shell (08-editor-workspace-shell.md): Implemented workspace shell with server-side access checks; build verified.
- Share Dialog (09-share-dialog.md): Collaborator management and project sharing; build verified.
- Liveblocks setup (10-liveblocks-setup.md): Configured Presence, UserMeta, and auth; build verified.
- Base collaborative canvas (11-base-canvas.md): Liveblocks-backed React Flow canvas foundation; build verified.
- Shape panel (12-shape-panel.md): Bottom shape panel with draggable shapes; build verified.
- Node shape (13-node-shape.md): Proper shape rendering (CSS/SVG) and ghost drag preview; build verified.
- Node editing (14-node-editing.md): Resizing and inline label editing; build verified.
- Node Color Toolbar (15-nodes-color-toolbar.md): Floating color toolbar for selected nodes; build verified.
- Edge Behaviour (16-edge-behaviour.md): Custom right-angle edges with arrows and inline label editing; build verified.
- Canvas Ergonomics (17-canvas-ergonomics.md): Added floating control bar for zoom and undo/redo; implemented keyboard shortcuts; build verified.
- Starter Templates (18-starter-template.md): Created template library and import modal with lightweight SVG previews; integrated "Templates" button in navbar to replace canvas with selected template; build verified.
- Presence and Live Cursors (19-presence-avatars-cursor.md): Implemented real-time collaborator presence with overlapping avatars and live cursors on the canvas; integrated Clerk UserButton with collaborator group; broadcast cursor positions via Liveblocks presence; build verified.
- AI Sidebar Shell (20-ai-sidebar-shell.md): Extracted AI sidebar into a separate component; implemented a tabbed UI with AI Architect and Specs tabs; added empty state, starter chips, and auto-resizing input for chat; added a static demo spec card and generate button; build verified.
- Canvas Autosave (21-canvas-autosave.md): Implemented `@vercel/blob` storage for canvas JSON and Prisma metadata persistence; added `useAutosave` hook with 2s debounce and cloud status indicator; integrated initial load from blob for empty rooms; build verified.
- Fixed Issue 1 & 7: Moved `CanvasProvider` higher to ensure Save button visibility in `EditorNavbar`; verified private blob access and SDK usage in API routes.
- Fixed React infinite loop: Memoized `useAutosave` return values and added state update guards in `CanvasProvider`.
- Fixed Issue 6: Added `img.clerk.com` to `next.config.ts`.
- Fixed Issue 1 follow-up: Memoized save functions in `useAutosave` and synced status between `CanvasControls` and `EditorNavbar` via `CanvasContext`.
- Fixed Issue 1 final: Ensured stable `triggerSave` reference in `CanvasContext` to prevent stale closure issues in `EditorNavbar`.
- Fixed Issue 1 Strict Mode Root Cause: Refactored `useAutosave` to use `useState` for loading state and removed unstable `useRef` guards that were causing silent failures in React Strict Mode; verified stable manual save trigger.
- Fixed Liveblocks Auth Timeout: Optimized Clerk API calls by fetching user identity once and passing it through the project access and auth flow, significantly reducing latency.
- Fixed Issue 2: Implemented collaborative node and edge deletion via Delete/Backspace keys; switched to `onDelete` helper from `useLiveblocksFlow` to ensure proper multiplayer synchronization.
- Fixed Autosave Selection Guard: Prevented autosave from firing while any node or edge is selected to avoid saving intermediate changes; verified that deselection triggers a delayed save.

## In Progress

- Phase 2: AI Integration
- AI Infrastructure: Configuring durable background tasks for AI generation.

## Completed

- Design system (01-design-system.md): shadcn/ui and Tailwind v4 setup; build verified.
