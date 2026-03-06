import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getLevelQuestions, TOTAL_QUESTIONS } from '../data/questions';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface GameAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
  level: number;
  answeredAt: string;
}

export interface GameProgress {
  currentLevel: number;        // 1–4
  currentQuestionIndex: number; // 0–5 within that level
  levelsCompleted: boolean[];   // [L1, L2, L3, L4]
  questCompleted: boolean;
  overallPercentage: number;
}

function defaultProgress(): GameProgress {
  return {
    currentLevel: 1,
    currentQuestionIndex: 0,
    levelsCompleted: [false, false, false, false],
    questCompleted: false,
    overallPercentage: 0,
  };
}

// ──────────────────────────────────────────────
// Supabase helpers
// ──────────────────────────────────────────────

async function dbLoadProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (!data) return null;
  return { id: data.id, email: data.email, displayName: data.display_name, createdAt: data.created_at };
}

async function dbLoadProgress(userId: string): Promise<GameProgress> {
  const { data } = await supabase.from('progress').select('*').eq('user_id', userId).single();
  if (!data) return defaultProgress();
  return {
    currentLevel: data.current_level ?? 1,
    currentQuestionIndex: data.current_question_index ?? 0,
    levelsCompleted: [
      data.level_1_completed ?? false,
      data.level_2_completed ?? false,
      data.level_3_completed ?? false,
      data.boss_completed ?? false,
    ],
    questCompleted: data.boss_completed ?? false,
    overallPercentage: data.overall_completion_percentage ?? 0,
  };
}

async function dbLoadAnswers(userId: string): Promise<Record<string, GameAnswer>> {
  const { data } = await supabase.from('answers').select('*').eq('user_id', userId);
  if (!data) return {};
  const map: Record<string, GameAnswer> = {};
  for (const row of data) {
    map[row.question_id] = {
      questionId: row.question_id,
      questionText: row.question_text,
      answerText: row.answer_text,
      level: parseInt(row.level) || 1,
      answeredAt: row.answered_at,
    };
  }
  return map;
}

function dbSaveProgress(userId: string, p: GameProgress) {
  supabase.from('progress').upsert({
    user_id: userId,
    current_level: p.currentLevel,
    current_sublevel: null,
    current_question_index: p.currentQuestionIndex,
    level_1_completed: p.levelsCompleted[0],
    level_2_completed: p.levelsCompleted[1],
    level_3_completed: p.levelsCompleted[2],
    boss_completed: p.levelsCompleted[3],
    overall_completion_percentage: p.overallPercentage,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then(({ error }) => {
    if (error) console.error('Progress save error:', error.message);
  });
}

function dbSaveAnswer(userId: string, a: GameAnswer) {
  supabase.from('answers').upsert({
    user_id: userId,
    question_id: a.questionId,
    question_text: a.questionText,
    answer_text: a.answerText,
    level: String(a.level),
    sublevel: null,
    answered_at: a.answeredAt,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,question_id' }).then(({ error }) => {
    if (error) console.error('Answer save error:', error.message);
  });
}

// ──────────────────────────────────────────────
// Store interface
// ──────────────────────────────────────────────

interface GameStore {
  user: UserProfile | null;
  progress: GameProgress;
  answers: Record<string, GameAnswer>;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<void>;

  // Progress & answers
  saveAnswer: (questionId: string, questionText: string, answerText: string, level: number) => void;
  getAnswer: (questionId: string) => string;
  setCurrentPosition: (level: number, questionIndex: number) => void;
  completeLevel: (level: number) => void;
  completeQuest: () => void;
  getLevelStatus: (level: number) => 'locked' | 'available' | 'completed';
  getLevelProgress: (level: number) => number; // 0-6 questions answered
  getAllAnswersFormatted: () => Array<{ question: string; answer: string; level: string }>;

  // Session
  initSession: () => Promise<void>;
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  progress: defaultProgress(),
  answers: {},
  isAuthenticated: false,
  isLoading: true,

  // ── Auth ──

  signUp: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Signup failed.' };

    await new Promise(r => setTimeout(r, 600));

    const profile = await dbLoadProfile(data.user.id);
    const progress = await dbLoadProgress(data.user.id);
    const answers = await dbLoadAnswers(data.user.id);

    set({
      user: profile ?? { id: data.user.id, email, displayName, createdAt: new Date().toISOString() },
      progress,
      answers,
      isAuthenticated: true,
      isLoading: false,
    });
    return { success: true };
  },

  logIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Login failed.' };

    const [profile, progress, answers] = await Promise.all([
      dbLoadProfile(data.user.id),
      dbLoadProgress(data.user.id),
      dbLoadAnswers(data.user.id),
    ]);

    supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

    set({
      user: profile ?? { id: data.user.id, email, displayName: '', createdAt: new Date().toISOString() },
      progress,
      answers,
      isAuthenticated: true,
      isLoading: false,
    });
    return { success: true };
  },

  logOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, progress: defaultProgress(), answers: {}, isAuthenticated: false, isLoading: false });
  },

  // ── Data ──

  saveAnswer: (questionId, questionText, answerText, level) => {
    const { user, answers, progress } = get();
    if (!user) return;

    const now = new Date().toISOString();
    const answer: GameAnswer = {
      questionId,
      questionText,
      answerText,
      level,
      answeredAt: answers[questionId]?.answeredAt || now,
    };

    const newAnswers = { ...answers, [questionId]: answer };
    const answeredCount = Object.values(newAnswers).filter(a => a.answerText.trim().length > 0).length;
    const pct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

    const newProgress = { ...progress, overallPercentage: pct };
    set({ answers: newAnswers, progress: newProgress });
    dbSaveAnswer(user.id, answer);
    dbSaveProgress(user.id, newProgress);
  },

  getAnswer: (questionId) => get().answers[questionId]?.answerText || '',

  setCurrentPosition: (level, questionIndex) => {
    const { user, progress } = get();
    if (!user) return;
    const newProgress = { ...progress, currentLevel: level, currentQuestionIndex: questionIndex };
    set({ progress: newProgress });
    dbSaveProgress(user.id, newProgress);
  },

  completeLevel: (level) => {
    const { user, progress } = get();
    if (!user) return;
    const levelsCompleted = [...progress.levelsCompleted];
    levelsCompleted[level - 1] = true;

    // Next level becomes current (unless quest complete)
    const nextLevel = level < 4 ? level + 1 : level;
    const newProgress = {
      ...progress,
      levelsCompleted,
      currentLevel: nextLevel,
      currentQuestionIndex: 0,
    };
    set({ progress: newProgress });
    dbSaveProgress(user.id, newProgress);
  },

  completeQuest: () => {
    const { user, progress } = get();
    if (!user) return;
    const levelsCompleted = [true, true, true, true];
    const newProgress = { ...progress, levelsCompleted, questCompleted: true, overallPercentage: 100 };
    set({ progress: newProgress });
    dbSaveProgress(user.id, newProgress);
  },

  getLevelStatus: (level) => {
    const { progress } = get();
    const idx = level - 1;
    if (progress.levelsCompleted[idx]) return 'completed';
    if (level === 1) return 'available';
    if (progress.levelsCompleted[idx - 1]) return 'available';
    return 'locked';
  },

  getLevelProgress: (level) => {
    const { answers } = get();
    const qs = getLevelQuestions(level);
    return qs.filter(q => {
      const a = answers[q.id];
      return a && a.answerText.trim().length > 0;
    }).length;
  },

  getAllAnswersFormatted: () => {
    const { answers } = get();
    const LEVEL_NAMES: Record<number, string> = {
      1: 'Level I: Know Thyself',
      2: 'Level II: Know Thy Work',
      3: 'Level III: Know Thy Market',
      4: 'Level IV: Know Thy People',
    };
    return Object.values(answers)
      .filter(a => a.answerText.trim().length > 0)
      .sort((a, b) => a.level - b.level)
      .map(a => ({
        question: a.questionText,
        answer: a.answerText,
        level: LEVEL_NAMES[a.level] || `Level ${a.level}`,
      }));
  },

  // ── Session bootstrap ──

  initSession: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      set({ isLoading: false });
      return;
    }

    const userId = session.user.id;
    const [profile, progress, answers] = await Promise.all([
      dbLoadProfile(userId),
      dbLoadProgress(userId),
      dbLoadAnswers(userId),
    ]);

    set({
      user: profile ?? {
        id: userId,
        email: session.user.email ?? '',
        displayName: session.user.user_metadata?.display_name ?? '',
        createdAt: session.user.created_at,
      },
      progress,
      answers,
      isAuthenticated: true,
      isLoading: false,
    });
  },
}));
