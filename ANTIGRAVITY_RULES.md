# 👑 Antigravity Master Rules: React 2025 Production

## 🏗 1. ARCHITECTURE & FOLDER STRUCTURE
- **Pattern:** Feature-Based Colocation.
- **Location:** All logic lives in `src/features/[feature-name]/`.
- **Internal structure:** - `api/` (TanStack Query hooks + Zod schemas)
  - `components/` (Feature-specific UI)
  - `types/` (TypeScript interfaces)
  - `tests/` (Vitest/Testing Library files)
- **Public API:** Each feature must have an `index.ts` to export only necessary modules.
- **Path Aliases:** Always use `@/` for imports (e.g., `@/components/ui/Button`). No relative paths.

## 🎨 2. UI & STYLING (ANT DESIGN ONLY)
- **Library:** Use **Ant Design** components for all UI elements.
- **Styling:** Use Ant Design's `style` prop or styled-components (if configured) for custom overrides. Avoid raw CSS/Tailwind.
- **Consistency:** adhere to the project's Ant Design theme configuration.
- **Icons:** Use `@ant-design/icons` exclusively.

## ⚡ 3. PERFORMANCE & CODE QUALITY (DRY)
- **Lazy Loading:** All route-level components must use `React.lazy()` with `<Suspense>`.
- **Hooks First:** Extract all business logic, API calls, and state management into custom hooks.
- **Complexity Limit:** Components exceeding 200 lines must be refactored into smaller sub-components.
- **Memoization:** Apply `useMemo` and `useCallback` for heavy computations or to prevent expensive re-renders in stable components.

## 🔐 4. SECURITY & DATA INTEGRITY
- **Data Validation:** Every API response must be validated using a **Zod Schema** at the boundary.
- **No Injections:** Strict ban on `dangerouslySetInnerHTML`. Use `DOMPurify` if parsing HTML is required.
- **Secrets:** Never hardcode API keys. Use `import.meta.env.VITE_`. Detect and warn if secrets are leaked in code.
- **CSP:** Maintain and update the Content Security Policy meta tag in `index.html`.

## 🧪 5. TESTING & VERIFICATION
- **Co-location:** Tests must exist within the feature folder.
- **Standards:** Every new feature requires a `.test.tsx` (Integration) or `.test.ts` (Unit) file.
- **Pre-Flight:** Run `npm run test` or `vitest run` before declaring any task complete.
- **Browser Check:** Use the browser agent to visually verify UI changes and check for console errors.

## 🚀 6. AGENTIC WORKFLOW (ANTIGRAVITY PROTOCOL)
- **Plan-First:** Generate an "Implementation Plan" Artifact before writing code. Wait for user approval.
- **Atomic Tasks:** Work on one sub-task at a time (e.g., Define Schema -> Build Hook -> Build UI -> Test).
- **Self-Correction:** If a build or test fails, analyze logs and fix autonomously.
- **Refactoring:** If the agent identifies a violation of the DRY principle, it must suggest a refactor immediately.

---
**Rule Version:** 1.1.0 (2025 Ant Design Standard)
**Tech Stack:** Vite, React, TanStack Query, Vitest, Zod, Ant Design.
