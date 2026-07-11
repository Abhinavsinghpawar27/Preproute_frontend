# CONTINUATION PROMPT — Resume PrepRoute Build (do not restart)

You are taking over an in-progress build of the "PrepRoute Test Management" frontend from another AI coding session that ran out of usage mid-task. **This is a continuation, not a fresh project.** Do not scaffold a new app, do not rewrite completed pages, and do not change tech-stack decisions already made.

## Step 0 — Orient yourself before writing any code
1. Read `SPEC.md` (or `docs/SPEC.md`) at the repo root in full — it is the source of truth for the entire app (API contract, all 5 pages, build plan).
2. Read `ASSUMPTIONS.md` — it lists every judgment call already made; do not re-litigate these, just follow them.
3. Run the app locally (`npm install && npm run dev`) and manually click through whatever currently exists — Login, Dashboard, and however much of the Create/Edit Test page is done — to see real current state instead of trusting file names alone.
4. Run `npx tsc --noEmit` and `npm run build` to see the actual current error state before touching anything.
5. Only after steps 1–4, tell me/yourself in one short summary: which phases (1–9, per the Build Plan in SPEC.md) are actually complete and working vs. partially done vs. not started. Use that as your real starting point, not what any prior chat log claims.

## Step 1 — Resume at Phase 5 (Create/Edit Test Page)
The prior session had already approved this plan for Phase 5 — implement it as specified, don't redesign it:

- **Total Marks** auto-calculates as `Correct Marks × Number of Questions`, recalculated whenever either input changes, but the field stays user-editable for override. Log this in `ASSUMPTIONS.md` if not already logged.
- **Topics & Sub-topics** are multi-select tag inputs (selected items render as dismissible tags), not plain single-select dropdowns — this matches both the API shape (`topics[]`, `sub_topics[]`) and the flow doc.
- Build a single reusable `<TestForm />` component, used in three places: the full Create page, the full Edit page, and the modal variant triggered from the pencil icon on the Questions page test-summary card. All three must stay in sync by sharing this one component — do not fork copies.
- New API service files: `subjectsApi.ts` (`getSubjects()` → `GET /subjects`) and `topicsApi.ts` (`getTopicsBySubject(subjectId)` → `GET /topics/subject/:subjectId`, and `getSubTopicsByTopics(topicIds)` → `POST /sub-topics/multi-topics` with `{ topicIds }`).
- `TestCreationPage.tsx`: loads existing test via `GET /tests/:id` when an `:id` route param is present (Edit mode); blank form otherwise (Create mode). Submits `POST /tests` (create) or `PUT /tests/:id` (edit). "Next" → redirect to `/test/:id/questions`. "Save as Draft" → submit with draft status, redirect to `/dashboard`.
- Update `ASSUMPTIONS.md` with the Total Marks and Test Type entries exactly as specified in the plan already written.

### Verification before marking Phase 5 done
- `npx tsc --noEmit` passes
- `npm run build` succeeds
- Manual check: subjects load on page open → selecting a subject loads its topics → selecting topics loads sub-topics → adjusting correct marks/question count recalculates total marks → "Save as Draft" persists with `status: draft` and returns to dashboard → "Next" creates/updates the test and redirects to the question builder route with the correct test id in the URL

## Step 2 — Keep going through the remaining phases
After Phase 5 is verified working, continue straight into Phase 6 (Add Questions page) and onward through Phase 9, exactly as laid out in `SPEC.md`'s Build Plan section. Same discipline as before:
- One phase at a time, verify compile + manual test before moving on
- Commit to git after each completed phase with a clear message
- Never invent an API endpoint or field not documented in Section 4 of `SPEC.md`
- Log any judgment calls in `ASSUMPTIONS.md` instead of guessing silently
- If you find something the prior session marked "done" that is actually broken or incomplete, fix it as part of whichever phase it belongs to, and note the correction — don't silently skip it and don't silently redo it from scratch either.

Begin with Step 0 now.