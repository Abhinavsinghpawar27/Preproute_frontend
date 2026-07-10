# ASSUMPTIONS — PrepRoute Test Management Application

This file documents assumptions and design choices made during development to resolve API/UI ambiguity.

## Phase 1 — Project Scaffolding
1. **React Version**: Although the spec mentions React 18, Vite generated a React 19 template. Modern versions of Zustand, React Router, Axios, and React Hook Form are compatible with React 19, so React 19 has been retained.
2. **State Management**: Zustand is preferred over Redux Toolkit due to its lower boilerplate, native TypeScript support, and ease of use.

## Phase 4 — Dashboard & Test List
1. **DELETE Endpoint**: Checked the API contract and confirmed there is no DELETE endpoint. The UI displays the Delete button in a disabled, greyed-out state and triggers a toast explanation ("Delete action is not supported by the backend API") if clicked, preventing any broken API calls.

## Phase 5 — Create/Edit Test Page
1. **Total Marks Auto-Calculation**: Total Marks is automatically computed as `correct_marks * total_questions` to speed up user input. However, the input remains editable to support custom marking schemes where the math might differ (e.g. weighted sections).
2. **Cascading Dropdowns**: Selected subject triggers topic fetch and resets selected topics/subtopics. Selected topics trigger subtopic fetch and filter out subtopics that no longer match the active topics.
3. **Alternative Tabs**: Selecting PYQ or Mock Test tabs switches the `type` value submitted to the backend, but reuses the same input layout and cascading options, as specified by the build plan.

## Phase 6 — Add Questions Page
1. **CSV Import Format**: CSV columns assumed as: `question,option1,option2,option3,option4,correct_option,explanation,difficulty`. If the first row contains the word "question" it is treated as a header and skipped.
2. **Local IDs**: Questions are tracked locally with `uuid`-generated IDs until saved to the backend via `POST /questions/bulk`.

## Phase 7 — Preview & Publish Page
1. **Schedule Fields**: The API contract has no dedicated fields for scheduling. The fields `publish_at` and `live_until` are sent on the same `PUT /tests/:id` call as additional properties. Field names will need backend confirmation before going live.
2. **Live Until Presets**: Options "1 Week", "2 Weeks", "3 Weeks", "1 Month" send string values (`1week`, `2weeks`, `3weeks`, `1month`) to the backend. The exact backend contract for these values is unspecified.


