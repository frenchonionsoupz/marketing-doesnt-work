export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

export interface Answer {
  questionId: string;
  questionText: string;
  answerText: string;
  level: string;
  sublevel: string | null;
  answeredAt: string;
  updatedAt: string;
}

export interface Progress {
  currentLevel: string;
  currentSublevel: string | null;
  currentQuestionIndex: number;
  level1Completed: boolean;
  level2Completed: boolean;
  level3Completed: boolean;
  bossCompleted: boolean;
  overallCompletionPercentage: number;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  level: string;
  sublevel: string | null;
  index: number;
}

export interface LevelInfo {
  id: string;
  name: string;
  subtitle: string;
  totalQuestions: number;
  sublevels?: SublevelInfo[];
}

export interface SublevelInfo {
  id: string;
  name: string;
  totalQuestions: number;
}

export type LevelStatus = 'locked' | 'available' | 'completed';
