# PROMPT FOR ANTIGRAVITY — Build "PrepRoute" Test Management Application

## ROLE & OPERATING RULES (read first, follow strictly)
You are building a production-grade React + TypeScript frontend application called **PrepRoute Test Management**. This is a scored technical evaluation, so:
- Do NOT invent, rename, or guess API fields, endpoints, or response shapes. Use ONLY the API contract given below, exactly as written. If a response field is not documented, treat it as optional/unknown and code defensively (optional chaining, fallback UI states) rather than guessing its shape.
- Do NOT skip any of the 5 pages. Build all of them fully functional and wired to real APIs — no mock data in the final build.
- If something in this prompt is genuinely ambiguous, make the most standard/sensible UX choice, implement it, and add a one-line comment `// ASSUMPTION:` explaining the choice. Do not stop and ask me mid-build — keep going and log assumptions in `ASSUMPTIONS.md`.
- Work in small verifiable phases (see "Build Plan" at the end). After each phase, run the app, fix TypeScript/lint errors, and confirm it compiles before moving to the next phase. Never move to Phase N+1 with a broken Phase N.
- Keep components small and typed. No `any` unless unavoidable (and then comment why).
- Commit to git after each completed phase with a clear commit message, so progress is checkpointed and nothing is lost if a later phase fails.

---

## 1. TECH STACK (mandatory)
- React 18 + TypeScript (Vite)
- React Router v6 for the 5-page flow
- State management: Redux Toolkit (or Zustand — pick one and use it consistently for: auth/token, current test-in-progress draft, and questions list)
- Axios for API calls, with a single centralized `axiosInstance` that:
  - Sets `baseURL = https://admin-moderator-backend-staging.up.railway.app/api`
  - Attaches `Authorization: Bearer <token>` from storage automatically via an interceptor
  - Has a response interceptor that catches 401 and redirects to `/login`
- Form validation: React Hook Form + Zod (or Yup) for every form (login, test creation, question form)
- Styling: Tailwind CSS, matching the exact look in the provided screenshots (see Section 3) and the Figma file: https://www.figma.com/design/Xe45bF7fnHroM1g1gDGXFR/Preproute-Assignment?node-id=0-1&t=YcqE8kZxcuERQ4IZ-1 — pull exact colors/spacing/typography from Figma via "Inspect" if you have Figma access; otherwise replicate pixel-closely from the screenshots described below.
- Toast notifications for success/error states (e.g. react-hot-toast)
- Environment variable for base URL (`.env` → `VITE_API_BASE_URL`), do not hardcode it in multiple places.

---

## 2. AUTHENTICATION
- Test credentials to use while developing/testing (do not hardcode into the UI, just use manually):
  - Username: `vedant-admin`
  - Password: `vedant123`
- Store JWT in `localStorage` under a namespaced key (e.g. `preproute_token`), plus store the returned `user` object.
- On app load, check for token in localStorage → if present, treat user as logged in and allow access to protected routes; if absent, force redirect to `/login`.
- Logout should clear storage and redirect to `/login`.
- Protect all routes except `/login` with a `ProtectedRoute` wrapper.

---

## 3. PAGES — EXACT SPEC (build pixel-close to these screenshots; the screenshots are the source of truth for layout, not just the written flow doc)

### PAGE 1 — Login (`/login`)
Two-column layout: left half is a light-blue/lavender background panel with a simple line-art illustration (a person figure at a desk with a laptop — decorative only, can use a placeholder SVG matching that flat line-art style, small "+" and circle decorative dots around it). Right half is a white panel, vertically centered, containing:
- "PrepRoute" logo/wordmark at top (blue, with the small squiggle icon above the "p")
- Heading "Login"
- Subtext: "Use your company provided Login credentials"
- Label "User ID" + text input, placeholder "Enter User ID"
- Label "Password" + password input, placeholder "Enter Password"
- "Forgot password?" link (blue), right-aligned under password field — for this task it can be a non-functional link or open a simple placeholder modal, it is NOT in the API doc so do not build real forgot-password flow
- Full-width blue "Login" button (rounded corners, `#5B7FEC`-ish blue)
- On submit: call `POST /auth/login` with `{ userId, password }`. On success, store token + user, redirect to `/dashboard` (Test List). On failure, show inline field error / toast with the API's error message.
- Validate both fields required before enabling submit.

### PAGE 2 — Dashboard / Test List (`/dashboard`)
This is the main shell used on every page after login. Persistent left sidebar (dark icons on white, active item highlighted blue with light-blue background pill):
- Logo top-left ("PrepRoute")
- Nav items with icons: "Dashboard" (trending-up icon), "Test Creation" (pencil-in-square icon, active state shown in screenshots), "Test Tracking" (clipboard-check icon)
- Top bar (right-aligned): notification bell icon (with small green dot badge), user avatar image, name "Alex Wando", role label "Admin" below it, small dropdown chevron next to name (can be a logout dropdown)
- Main content area: table/card list of all tests fetched from `GET /tests` — show columns: Name, Subject, Status (badge — draft/live etc), Created Date, Topics. Row actions: **Edit**, **View**, **Delete**.
  - Edit → navigate to Create/Edit Test page pre-filled with that test's data (fetch via `GET /tests/:id`)
  - View → navigate to a read-only Preview of that test
  - Delete → confirm modal, then call the appropriate delete behavior (the doc does not give a DELETE endpoint — if none exists, disable/hide Delete or show "not available" rather than guessing an endpoint; note this in ASSUMPTIONS.md)
- "Create New Test" primary button → navigates to Page 3
- Bonus (nice to have, not required): client-side search/filter by name/subject/status.

### PAGE 3 — Create/Edit Test (`/test/create` and `/test/:id/edit`)
Breadcrumb at top: `Test Creation / Create Test / Chapter Wise`
Tab row directly under breadcrumb: **Chapterwise | PYQ | Mock Test** (these correspond to the `type` field sent to the API — `chapterwise`, `pyq` or similar, `mock`; only "Chapterwise" needs to be fully functional per the flow doc, the other tabs can just switch the `type` value and reuse the same form).

Two-column form layout:
- Left column: Subject (dropdown, populated from `GET /subjects`), Topic (dropdown, populated from `GET /topics/subject/:subjectId` — only enabled after Subject is chosen, multi-select capable per the flow doc even though screenshot shows single dropdown control — implement as multi-select dropdown/tag input), Duration (Minutes) numeric input
- Right column: Name of Test text input, Sub Topic (dropdown from `POST /sub-topics/multi-topics` passing the selected topic IDs — multi-select, only enabled after at least one Topic is chosen), Test Difficulty Level — 3 radio buttons: Easy / Medium / Difficult
- "Marking Scheme:" section with 3 numeric stepper inputs side by side: **Wrong Answer** (default −1), **Unattempted** (default +0), **Correct Answer** (default +5) — these map to `wrong_marks`, `unattempt_marks`, `correct_marks`
- "No of Questions" numeric input, "Total Marks" numeric input (can be read-only/auto-calculated as correct_marks × no_of_questions, or left editable — pick one, note as ASSUMPTION)
- Bottom right: "Cancel" (secondary, light) and "Next" (primary blue) buttons
- Validate all required fields (per the flow doc: Test Name, Subject, Test Type, Topics, Difficulty, marking scheme, total time, total marks are required) before allowing "Next"
- On "Next": call `POST /tests` (create) or `PUT /tests/:id` (edit) with the payload shape from API doc section 6/7, save the returned `test-uuid`, then navigate to Page 4 with that test id.
- Also support "Save as Draft" (per flow doc) — same POST/PUT but with `status: null`/`draft` and stays on dashboard instead of navigating to questions. Add this as a secondary action even though it's not pixel-shown in the screenshot, since the requirement doc calls for it explicitly.
- There is also an **"Edit Test creation" modal** version of this exact same form (see screenshot 6) used when editing test metadata from within the Question Creation page (via the pencil icon next to the test summary card) — build this as a reusable `<TestFormFields />` component rendered both as a full page and inside a modal, so the two never drift out of sync.

### PAGE 4 — Add Questions (`/test/:id/questions`)
Layout: same sidebar shell as Dashboard. Top of main content: breadcrumb `Test Creation / Create Test / Chapter Wise`, and top-right a **Publish** button (goes to Page 5).

Below breadcrumb, a **test summary card**: badge for test type ("Chapter Wise"), a small icon + "Chapter 1" label + difficulty badge ("Easy" in teal), edit (pencil) icon top-right of card that opens the Edit Test modal from Page 3, then rows: `Subject : English`, `Topic : Grammar Writing` (rendered as separate tag pills), `Sub Topic : Application` (tag pill), and on the right side of the card: `60 Min | 50 Q's | 250 Marks` stat pills — all of this pulled live from the created test object, not hardcoded.

Left secondary sidebar panel "Question creation" (collapsible via the `«` icon) showing:
- "Total Questions . 50" (this is the target `total_questions` set in Page 3, not necessarily how many have been added yet — reflect actual added-count vs target, e.g. "Total Questions . 4/50")
- A vertical list of question entries, each a pill-button labeled "Question 1", "Question 2"... with a green checkmark circle once that question is filled in and a right-chevron; clicking one loads that question into the editor on the right for editing. Currently-open question is highlighted (light green border, as in screenshot 5).

Right main panel:
- "Question {n}/{total}" label, and on the right: "+ MCQ" button (adds a new blank question slot) and "↓ CSV" button (bulk import questions from a CSV file — parse client-side into the same shape as the question form and add all to the list)
- "Delete All Edits" (red text link) — clears the current in-progress question form
- Rich text toolbar above the question text box (Bold/Italic/Underline/Strikethrough/Link/Image/alignment/formula icons) — a lightweight rich text editor (e.g. a minimal contentEditable or a library like `react-quill`) is acceptable; store as plain text or HTML string in `question`
- Question textarea, placeholder "Type here"
- "Type the options below" — 4 radio-selectable option rows (option1–option4), each with a text input placeholder "Type Option here" and a delete/trash icon; the selected radio marks `correct_option`
- Also include (per flow doc, not fully shown in screenshot but required): Explanation (optional textarea), Difficulty (optional dropdown), Topic/Sub-topic (optional dropdowns scoped to the test's subject), Media URL (optional text input)
- "Add Another Question" behavior = same as "+ MCQ" button: pushes current question into local list (validate: question text + all 4 options + correct_option required) and opens a fresh blank form
- Minimum 1 question required before allowing progression to Page 5
- "Save & Continue" button: on click, call `POST /questions/bulk` sending all locally-built questions (each with `test_id` set to the current test's id, `type: "mcq"`), then call `PUT /tests/:id` with the returned `question-uuid`s in `questions[]` plus updated `total_questions`/`total_marks`, then navigate to Page 5.
- Support editing/deleting an already-added question from the left list before final save.

### PAGE 5 — Preview & Publish (`/test/:id/preview`)
Same sidebar shell. Breadcrumb `Test Creation / Create Test / Chapter Wise`, top-right **Publish** button.
- Shows the same test summary card as Page 4 (reused component) plus a full read-only list of ALL added questions with their options, correct answer indicated, fetched via `POST /questions/fetchBulk` using the `question_ids` stored on the test.
- "Edit" affordances to jump back to Page 3 (test details) or Page 4 (a specific question) — reuse components, don't rebuild.
- **Publish Test** button: calls `PUT /tests/:id` with `{ status: "live" }` (API doc section 10).
- There is also a **Schedule Publish** variant (screenshot 1 & 3, header "Test creation" / "Test created" with a green "All 50 Questions done" badge): a tab toggle "Publish Now" vs "Schedule Publish". If "Schedule Publish" is chosen, show "Select Date and Time" (date + time pickers) and a "Live Until" section with radio options: Always Available / 1 Week / 2 Weeks / 3 Weeks / 1 Month / Custom Duration — selecting "Custom Duration" reveals "Select End Date" + "Select End Time" pickers. Since the API doc has no dedicated schedule/expiry fields documented, send these as best-guess additional fields on the same `PUT /tests/:id` call (e.g. `publish_at`, `live_until`) and clearly note in `ASSUMPTIONS.md` that the backend contract for scheduling wasn't specified, so this is UI-complete but may need backend field-name confirmation.
- On successful publish: show a success message/toast and redirect to Dashboard (Page 2), where the test now shows status "live".

---

## 4. FULL API CONTRACT (use exactly as-is — do not alter field names or endpoints)

Base URL: `https://admin-moderator-backend-staging.up.railway.app/api`
All endpoints except login require header: `Authorization: Bearer <token>`

1. **POST `/auth/login`** — body `{ userId, password }` → `{ success, data: { token, user } }`
2. **GET `/subjects`** → `{ success, data: [{ id, name }] }`
3. **GET `/topics/subject/:subjectId`** → `{ success, data: [{ id, name, subject_id }] }`
4. **GET `/sub-topics/topic/:topicId`** → `{ success, data: [{ id, name, topic_id }] }`
5. **GET `/tests`** → `{ success, data: [{ id, name, subject, topics[], status, created_at }] }`
6. **POST `/tests`** — body: `{ name, type, subject, topics[], sub_topics[], correct_marks, wrong_marks, unattempt_marks, difficulty, total_time, total_marks, total_questions, status }` → `{ success, data: {...}, message }`
7. **PUT `/tests/:id`** — partial body, e.g. `{ name, questions[], total_questions, total_marks }` or `{ status: "live" }`
8. **GET `/tests/:id`** → `{ success, data: { id, name, subject, topics[], questions[], ... } }`
9. **POST `/questions/bulk`** — body `{ questions: [{ type, question, option1, option2, option3, option4, correct_option, explanation, difficulty, test_id }] }` → `{ success, data: [...], message }`
10. **PUT `/tests/:id`** with `{ status: "live" }` — publish
11. **POST `/sub-topics/multi-topics`** — body `{ topicIds: [...] }`
12. **POST `/questions/fetchBulk`** — body `{ question_ids: [...] }`

Build one typed API service file per resource (`authApi.ts`, `subjectsApi.ts`, `topicsApi.ts`, `testsApi.ts`, `questionsApi.ts`) rather than scattering axios calls in components.

---

## 5. NON-FUNCTIONAL REQUIREMENTS
- Fully responsive (mobile/tablet/desktop) per Figma breakpoints.
- Loading states (skeletons/spinners) for every API call; empty states for empty lists; error states with retry.
- Global error boundary + toast for uncaught API failures.
- `.env.example` with `VITE_API_BASE_URL`.
- `README.md` covering: setup instructions, tech decisions, folder structure, known assumptions/limitations, and how auth/token flow works.
- Clean, consistent folder structure, e.g.:
  ```
  src/
    api/
    components/
    features/ (auth, tests, questions)
    pages/
    routes/
    store/
    types/
    utils/
  ```
- No console errors/warnings on any page in the happy path.

---

## 6. DELIVERABLES TO PREPARE AT THE END
- GitHub repo (clean commit history matching the phases below)
- Deployed working app (Vercel/Netlify)
- `ASSUMPTIONS.md` listing every place a guess was made due to underspecified API/UI
- Short written summary of technical decisions for the README

---

## 7. BUILD PLAN (execute in this order; verify compile + basic manual test after each phase before continuing)
1. Scaffold Vite + React + TS + Tailwind + Router + Redux Toolkit/Zustand + Axios instance + env config.
2. Auth: Login page UI, form validation, login API call, token storage, ProtectedRoute, logout.
3. App shell: sidebar + topbar layout used by pages 2–5, matching screenshots exactly.
4. Dashboard: fetch and render test list, actions wired (Edit/View/Delete per Section 3).
5. Create/Edit Test page: full form, dropdown cascades (Subject→Topic→Sub-topic), validation, create/update API calls, Save as Draft, reusable form component + modal variant.
6. Add Questions page: question list sidebar, question form with rich text + options + optional fields, add/edit/delete locally, CSV import, bulk save API call, min-1-question validation.
7. Preview & Publish page: read-only test + questions view via fetchBulk, edit-jump links, Publish Now flow, Schedule Publish UI + tab toggle.
8. Polish pass: loading/error/empty states, responsiveness, toasts, accessibility basics (labels, focus states).
9. Write README + ASSUMPTIONS.md, set up `.env.example`, final QA pass against every screenshot and every API endpoint in Section 4.
10. Deploy and produce the walkthrough-video-ready state (make sure every flow in the flow doc works end-to-end without console errors before recording).

Begin with Phase 1 now.
