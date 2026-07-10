# PrepRoute Test Management — Frontend

A production-grade React + TypeScript SPA for creating, managing and publishing educational assessments.

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd PrepRoute_Frontend

# Install dependencies
npm install

# Copy the env file
cp .env.example .env
```

### Environment Variables

Create a `.env` file at the project root (copy from `.env.example`):

```env
VITE_API_BASE_URL=https://admin-moderator-backend-staging.up.railway.app/api
```

### Running Locally

```bash
npm run dev
```

The application will be served at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

The optimised output will be in the `dist/` directory.

---

## Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 19 + Vite | Fast HMR dev server, ESM-native bundling |
| Language | TypeScript (strict) | End-to-end type safety; no `any` unless commented |
| Routing | React Router v6 | File-convention compatible, nested protected routes |
| State | Zustand | Minimal boilerplate; fully typed; avoids Redux ceremony |
| Forms | React Hook Form + Zod | Schema-first validation, performant controlled inputs |
| HTTP | Axios (centralized instance) | Single interceptor point for auth token attachment and 401 redirect |
| Styling | Tailwind CSS v4 | Utility-first with CSS custom properties for brand tokens |
| Icons | Lucide React | Consistent, tree-shakeable icon set |
| Notifications | react-hot-toast | Lightweight, accessible toast system |
| IDs | uuid v4 | Collision-resistant local question IDs before backend assignment |

---

## Folder Structure

```
src/
├── api/                 # One typed service file per resource
│   ├── axiosInstance.ts    # Centralized Axios with request/response interceptors
│   ├── authApi.ts
│   ├── subjectsApi.ts
│   ├── topicsApi.ts
│   ├── testsApi.ts
│   └── questionsApi.ts
├── components/          # Reusable UI components
│   ├── AppLayout.tsx       # Persistent sidebar + topbar shell
│   ├── TestForm.tsx        # Reusable form used in create page and edit modal
│   └── MultiSelect.tsx     # Custom multi-value tag select dropdown
├── pages/               # One file per route
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TestCreationPage.tsx
│   ├── AddQuestionsPage.tsx
│   └── PreviewPublishPage.tsx
├── routes/              # Routing configuration
│   ├── AppRoutes.tsx       # BrowserRouter + all routes
│   └── ProtectedRoute.tsx  # Outlet wrapper that redirects to /login if not authed
├── store/               # Zustand stores
│   ├── useAuthStore.ts     # JWT token + user object, synced to localStorage
│   └── useTestDraftStore.ts # Local draft questions state during question builder session
└── types/               # Shared TypeScript interfaces
    └── index.ts
```

---

## Auth / Token Flow

1. User submits User ID + Password on the Login page.
2. `POST /auth/login` responds with `{ success, data: { token, user } }`.
3. `token` is stored in `localStorage` under the key `preproute_token`; `user` under `preproute_user`.
4. The Zustand `useAuthStore` is hydrated from `localStorage` on app load — if a token exists the user is treated as authenticated.
5. Every outgoing Axios request has `Authorization: Bearer <token>` attached via request interceptor.
6. A response interceptor catches HTTP 401 responses: clears storage and redirects to `/login`.
7. The `ProtectedRoute` component wraps all authenticated routes — it reads `isAuthenticated` from `useAuthStore` and redirects unauthenticated visitors to `/login`.
8. Logout clears the Zustand store and `localStorage`, then navigates to `/login`.

---

## 5-Page Flow

| # | Route | Description |
|---|---|---|
| 1 | `/login` | Authentication with User ID + Password |
| 2 | `/dashboard` | List all tests, search/filter, Edit/View/Delete actions |
| 3 | `/test/create` or `/test/:id/edit` | Full test configuration form with cascading dropdowns |
| 4 | `/test/:id/questions` | Question builder with MCQ form, CSV import, local draft state |
| 5 | `/test/:id/preview` | Read-only preview + Publish Now or Schedule Publish |

---

## Known Assumptions & Limitations

See [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) for the full list.

Key items:
- There is **no DELETE endpoint** in the API contract. The Delete button is rendered as disabled with a user-facing toast explanation.
- **Schedule Publish** fields (`publish_at`, `live_until`) are additional properties sent on `PUT /tests/:id`. Backend field names are unspecified and will need confirmation.
- **Total Marks** is auto-calculated as `correct_marks × total_questions` but remains editable.
- **CSV Import** assumes column order: `question, option1, option2, option3, option4, correct_option, explanation, difficulty`.

---

## Test Credentials (Development Only)

```
User ID:  vedant-admin
Password: vedant123
```

Do not hardcode these in the application UI. Use them manually while testing.
