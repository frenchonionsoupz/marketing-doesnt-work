import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { User, Answer, Progress } from '../types';
import { TOTAL_QUESTIONS } from '../data/questions';

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

interface GameState {
  user: User | null;
  progress: Progress;
  answers: Record<string, Answer>;
  isAuthenticated: boolean;
  startTime: string | null;

  signUp: (email: string, password: string, displayName: string) => { success: boolean; error?: string };
  logIn: (email: string, password: string) => { success: boolean; error?: string };
  logOut: () => void;
  deleteAccount: () => void;

  saveAnswer: (questionId: string, questionText: string, answerText: string, level: string, sublevel: string | null) => void;
  getAnswer: (questionId: string) => string;
  setCurrentPosition: (level: string, sublevel: string | null, questionIndex: number) => void;
  completeLevel: (level: string) => void;
  getCompletionPercentage: () => number;
  getLevelStatus: (level: string) => 'locked' | 'available' | 'completed';
  getAnswersForLevel: (level: string, sublevel?: string | null) => Answer[];
  resetLevel: (level: string) => void;
  getTimeInvested: () => string;
}

function getDefaultProgress(): Progress {
  return {
    currentLevel: '1',
    currentSublevel: '1a',
    currentQuestionIndex: 0,
    level1Completed: false,
    level2Completed: false,
    level3Completed: false,
    bossCompleted: false,
    overallCompletionPercentage: 0,
    updatedAt: new Date().toISOString(),
  };
}

function loadUserData(userId: string): { progress: Progress; answers: Record<string, Answer>; startTime: string | null } {
  const progressStr = localStorage.getItem(`progress_${userId}`);
  const answersStr = localStorage.getItem(`answers_${userId}`);
  const startTime = localStorage.getItem(`startTime_${userId}`);
  return {
    progress: progressStr ? JSON.parse(progressStr) : getDefaultProgress(),
    answers: answersStr ? JSON.parse(answersStr) : {},
    startTime,
  };
}

function saveProgress(userId: string, progress: Progress) {
  localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
}

function saveAnswers(userId: string, answers: Record<string, Answer>) {
  localStorage.setItem(`answers_${userId}`, JSON.stringify(answers));
}

export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  progress: getDefaultProgress(),
  answers: {},
  isAuthenticated: false,
  startTime: null,

  signUp: (email, password, displayName) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const user: User = {
      id: uuidv4(),
      email,
      displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    users[email] = { ...user, passwordHash: hashPassword(password) };
    localStorage.setItem('users', JSON.stringify(users));

    const startTime = new Date().toISOString();
    localStorage.setItem(`startTime_${user.id}`, startTime);
    localStorage.setItem('currentUser', email);

    set({
      user,
      progress: getDefaultProgress(),
      answers: {},
      isAuthenticated: true,
      startTime,
    });

    return { success: true };
  },

  logIn: (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const storedUser = users[email];

    if (!storedUser) {
      return { success: false, error: 'No account found with this email.' };
    }

    if (storedUser.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Incorrect password.' };
    }

    storedUser.lastLogin = new Date().toISOString();
    users[email] = storedUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', email);

    const { progress, answers, startTime } = loadUserData(storedUser.id);

    const user: User = {
      id: storedUser.id,
      email: storedUser.email,
      displayName: storedUser.displayName,
      createdAt: storedUser.createdAt,
      lastLogin: storedUser.lastLogin,
    };

    set({ user, progress, answers, isAuthenticated: true, startTime });
    return { success: true };
  },

  logOut: () => {
    localStorage.removeItem('currentUser');
    set({
      user: null,
      progress: getDefaultProgress(),
      answers: {},
      isAuthenticated: false,
      startTime: null,
    });
  },

  deleteAccount: () => {
    const { user } = get();
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    delete users[user.email];
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem(`progress_${user.id}`);
    localStorage.removeItem(`answers_${user.id}`);
    localStorage.removeItem(`startTime_${user.id}`);
    localStorage.removeItem('currentUser');

    set({
      user: null,
      progress: getDefaultProgress(),
      answers: {},
      isAuthenticated: false,
      startTime: null,
    });
  },

  saveAnswer: (questionId, questionText, answerText, level, sublevel) => {
    const { user, answers } = get();
    if (!user) return;

    const now = new Date().toISOString();
    const answer: Answer = {
      questionId,
      questionText,
      answerText,
      level,
      sublevel,
      answeredAt: answers[questionId]?.answeredAt || now,
      updatedAt: now,
    };

    const newAnswers = { ...answers, [questionId]: answer };
    set({ answers: newAnswers });
    saveAnswers(user.id, newAnswers);

    const percentage = get().getCompletionPercentage();
    const newProgress = { ...get().progress, overallCompletionPercentage: percentage, updatedAt: now };
    set({ progress: newProgress });
    saveProgress(user.id, newProgress);
  },

  getAnswer: (questionId) => {
    const { answers } = get();
    return answers[questionId]?.answerText || '';
  },

  setCurrentPosition: (level, sublevel, questionIndex) => {
    const { user, progress } = get();
    if (!user) return;

    const newProgress = {
      ...progress,
      currentLevel: level,
      currentSublevel: sublevel,
      currentQuestionIndex: questionIndex,
      updatedAt: new Date().toISOString(),
    };
    set({ progress: newProgress });
    saveProgress(user.id, newProgress);
  },

  completeLevel: (level) => {
    const { user, progress } = get();
    if (!user) return;

    const updates: Partial<Progress> = { updatedAt: new Date().toISOString() };
    if (level === '1') updates.level1Completed = true;
    if (level === '2') updates.level2Completed = true;
    if (level === '3') updates.level3Completed = true;
    if (level === 'boss') updates.bossCompleted = true;

    const newProgress = { ...progress, ...updates };
    newProgress.overallCompletionPercentage = get().getCompletionPercentage();
    set({ progress: newProgress });
    saveProgress(user.id, newProgress);
  },

  getCompletionPercentage: () => {
    const { answers } = get();
    const answeredCount = Object.values(answers).filter(a => a.answerText.trim().length > 0).length;
    return Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
  },

  getLevelStatus: (level) => {
    const { progress } = get();

    if (level === '1') {
      return progress.level1Completed ? 'completed' : 'available';
    }
    if (level === '2') {
      if (progress.level2Completed) return 'completed';
      return progress.level1Completed ? 'available' : 'locked';
    }
    if (level === '3') {
      if (progress.level3Completed) return 'completed';
      return progress.level2Completed ? 'available' : 'locked';
    }
    if (level === 'boss') {
      if (progress.bossCompleted) return 'completed';
      return progress.level3Completed ? 'available' : 'locked';
    }
    return 'locked';
  },

  getAnswersForLevel: (level, sublevel) => {
    const { answers } = get();
    return Object.values(answers).filter(a => {
      if (a.level !== level) return false;
      if (sublevel !== undefined && a.sublevel !== sublevel) return false;
      return a.answerText.trim().length > 0;
    });
  },

  resetLevel: (level) => {
    const { user, answers, progress } = get();
    if (!user) return;

    const newAnswers = { ...answers };
    Object.keys(newAnswers).forEach(key => {
      if (newAnswers[key].level === level) {
        delete newAnswers[key];
      }
    });

    const updates: Partial<Progress> = {};
    if (level === '1') updates.level1Completed = false;
    if (level === '2') updates.level2Completed = false;
    if (level === '3') updates.level3Completed = false;
    if (level === 'boss') updates.bossCompleted = false;

    const newProgress = { ...progress, ...updates, updatedAt: new Date().toISOString() };
    set({ answers: newAnswers, progress: newProgress });
    saveAnswers(user.id, newAnswers);
    saveProgress(user.id, newProgress);
  },

  getTimeInvested: () => {
    const { startTime } = get();
    if (!startTime) return '0 minutes';
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const mins = Math.floor((now - start) / 60000);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''}`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  },
}));

export function tryAutoLogin(): boolean {
  const currentEmail = localStorage.getItem('currentUser');
  if (!currentEmail) return false;

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const storedUser = users[currentEmail];
  if (!storedUser) return false;

  const { progress, answers, startTime } = loadUserData(storedUser.id);
  const user: User = {
    id: storedUser.id,
    email: storedUser.email,
    displayName: storedUser.displayName,
    createdAt: storedUser.createdAt,
    lastLogin: storedUser.lastLogin,
  };

  useGameStore.setState({ user, progress, answers, isAuthenticated: true, startTime });
  return true;
}
