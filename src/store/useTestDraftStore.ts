import { create } from 'zustand';
import type { Question, Test } from '../types';

// Local draft question (before saving to backend)
export interface DraftQuestion {
  localId: string; // UUID for local tracking only
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: 'option1' | 'option2' | 'option3' | 'option4' | '';
  explanation: string;
  difficulty: string;
  test_id: string;
  isSaved?: boolean; // true once saved to backend
  savedId?: string;  // id returned from backend after save
}

interface TestDraftState {
  currentTest: Test | null;
  draftQuestions: DraftQuestion[];
  activeQuestionLocalId: string | null;

  setCurrentTest: (test: Test) => void;
  clearCurrentTest: () => void;
  addQuestion: (q: DraftQuestion) => void;
  updateQuestion: (localId: string, updates: Partial<DraftQuestion>) => void;
  removeQuestion: (localId: string) => void;
  setActiveQuestion: (localId: string | null) => void;
  markQuestionsAsSaved: (savedQuestions: Question[]) => void;
  clearDraft: () => void;
}

export const useTestDraftStore = create<TestDraftState>((set) => ({
  currentTest: null,
  draftQuestions: [],
  activeQuestionLocalId: null,

  setCurrentTest: (test) => set({ currentTest: test }),

  clearCurrentTest: () => set({ currentTest: null }),

  addQuestion: (q) =>
    set((state) => ({
      draftQuestions: [...state.draftQuestions, q],
      activeQuestionLocalId: q.localId,
    })),

  updateQuestion: (localId, updates) =>
    set((state) => ({
      draftQuestions: state.draftQuestions.map((q) =>
        q.localId === localId ? { ...q, ...updates } : q
      ),
    })),

  removeQuestion: (localId) =>
    set((state) => {
      const filtered = state.draftQuestions.filter((q) => q.localId !== localId);
      const newActive =
        state.activeQuestionLocalId === localId
          ? (filtered[filtered.length - 1]?.localId ?? null)
          : state.activeQuestionLocalId;
      return { draftQuestions: filtered, activeQuestionLocalId: newActive };
    }),

  setActiveQuestion: (localId) => set({ activeQuestionLocalId: localId }),

  markQuestionsAsSaved: (savedQuestions) =>
    set((state) => ({
      draftQuestions: state.draftQuestions.map((dq) => {
        // Match by question text since we don't have a local-to-saved mapping
        const match = savedQuestions.find((sq) => sq.question === dq.question);
        return match ? { ...dq, isSaved: true, savedId: match.id } : dq;
      }),
    })),

  clearDraft: () =>
    set({ currentTest: null, draftQuestions: [], activeQuestionLocalId: null }),
}));
