export interface User {
  id?: string;
  userId?: string;
  username?: string;
  name?: string;
  role?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export type TestStatus = 'draft' | 'live' | null;

export interface Test {
  id: string;
  name: string;
  type: string; // chapterwise, pyq, mock
  subject: string; // Subject name or subject UUID depending on request/response context
  topics: string[]; // List of topic names or UUIDs
  sub_topics?: string[];
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: string;
  total_time?: number;
  total_marks?: number;
  total_questions?: number;
  status: TestStatus;
  created_at: string;
  questions: string[]; // List of question UUIDs
}

export interface Question {
  id?: string;
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: 'option1' | 'option2' | 'option3' | 'option4' | '';
  explanation?: string;
  difficulty?: string;
  test_id: string;
}
