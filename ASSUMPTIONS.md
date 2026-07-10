# ASSUMPTIONS — PrepRoute Test Management Application

This file documents assumptions and design choices made during development to resolve API/UI ambiguity.

## Phase 1 — Project Scaffolding
1. **React Version**: Although the spec mentions React 18, Vite generated a React 19 template. Modern versions of Zustand, React Router, Axios, and React Hook Form are compatible with React 19, so React 19 has been retained.
2. **State Management**: Zustand is preferred over Redux Toolkit due to its lower boilerplate, native TypeScript support, and ease of use.
