import { create } from 'zustand';
import type { User, Answer, Progress } from '../types';
import { TOTAL_QUESTIONS } from '../data/questions';
import { supabase } from '../lib/supabase';

interface GameState {
  user: User | null;
  progress: Progress;
  answers: Record<string, Answer>;
  isAuthenticated: boolean;
  isLoading: boolean;
  startTime: string | null;

  // Auth — all async now
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;

  // Data — optimistic local + async DB write
  saveAnswer: (questionId: string, questionText: string, answerText: string, level: string, sublevel: string | null) => void;
  getAnswer: (questionId: string) => string;
  setCurrentPosition: (level: string, sublevel: string | null, questionIndex: number) => void;
  completeLevel: (level: string) => void;
  getCompletionPercentage: () => number;
  getLevelStatus: (level: string) => 'locked' | 'available' | 'completed';
  getAnswersForLevel: (level: string, sublevel?: string | null) => Answer[];
  resetLevel: (level: string) => void;
  getTimeInvested: () => string;

  // Session bootstrap
  initSession: () => Promise<void>;
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

// ---------- Supabase helpers (fire-and-forget) ----------

async function loadUserProfile(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    createdAt: data.created_at,
    lastLogin: data.last_login,
  };
}

async function loadProgress(userId: string): Promise<{ progress: Progress; startTime: string | null }> {
  const { data } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) return { progress: getDefaultProgress(), startTime: null };
  return {
    progress: {
      currentLevel: data.current_level,
      currentSublevel: data.current_sublevel,
      currentQuestionIndex: data.current_question_index,
      level1Completed: data.level_1_completed,
      level2Completed: data.level_2_completed,
      level3Completed: data.level_3_completed,
      bossCompleted: data.boss_completed,
      overallCompletionPercentage: data.overall_completion_percentage,
      updatedAt: data.updated_at,
    },
    startTime: data.start_time,
  };
}

async function loadAnswers(userId: string): Promise<Record<string, Answer>> {
  const { data } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', userId);

  if (!data) return {};
  const map: Record<string, Answer> = {};
  for (const row of data) {
    map[row.question_id] = {
      questionId: row.question_id,
      questionText: row.question_text,
      answerText: row.answer_text,
      level: row.level,
      sublevel: row.sublevel,
      answeredAt: row.answered_at,
      updatedAt: row.updated_at,
    };
  }
  return map;
}

function persistProgress(userId: string, progress: Progress, startTime: string | null) {
  supabase.from('progress').upsert({
    user_id: userId,
    current_level: progress.currentLevel,
    current_sublevel: progress.currentSublevel,
    current_question_index: progress.currentQuestionIndex,
    level_1_completed: progress.level1Completed,
    level_2_completed: progress.level2Completed,
    level_3_completed: progress.level3Completed,
    boss_completed: progress.bossCompleted,
    overall_completion_percentage: progress.overallCompletionPercentage,
    start_time: startTime ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then(({ error }) => {
    if (error) console.error('Progress save error:', error.message);
  });
}

function persistAnswer(userId: string, answer: Answer) {
  supabase.from('answers').upsert({
    user_id: userId,
    question_id: answer.questionId,
    question_text: answer.questionText,
    answer_text: answer.answerText,
    level: answer.level,
    sublevel: answer.sublevel,
    answered_at: answer.answeredAt,
    updated_at: answer.updatedAt,
  }, { onConflict: 'user_id,question_id' }).then(({ error }) => {
    if (error) console.error('Answer save error:', error.message);
  });
}

// ---------- Store ----------

export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  progress: getDefaultProgress(),
  answers: {},
  isAuthenticated: false,
  isLoading: true,
  startTime: null,

  // ---- Auth ----

  signUp: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Signup failed. Please try again.' };

    // The DB trigger creates profile + progress rows automatically.
    // Give the trigger a moment, then load.
    await new Promise(r => setTimeout(r, 500));

    const profile = await loadUserProfile(data.user.id);
    const { progress, startTime } = await loadProgress(data.user.id);
    const answers = await loadAnswers(data.user.id);

    set({
      user: profile ?? {
        id: data.user.id,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      progress,
      answers,
      isAuthenticated: true,
      isLoading: false,
      startTime,
    });

    return { success: true };
  },

  logIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Login failed.' };

    const profile = await loadUserProfile(data.user.id);
    const { progress, startTime } = await loadProgress(data.user.id);
    const answers = await loadAnswers(data.user.id);

    // Update last_login
    supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

    set({
      user: profile ?? {
        id: data.user.id,
        email,
        displayName: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      progress,
      answers,
      isAuthenticated: true,
      isLoading: false,
      startTime,
    });

    return { success: true };
  },

  logOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      progress: getDefaultProgress(),
      answers: {},
      isAuthenticated: false,
      isLoading: false,
      startTime: null,
    });
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) return;

    // Delete user data (cascade will handle related rows)
    // We delete from profiles which cascades to progress & answers
    await supabase.from('answers').delete().eq('user_id', user.id);
    await supabase.from('progress').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();

    set({
      user: null,
      progress: getDefaultProgress(),
      answers: {},
      isAuthenticated: false,
      isLoading: false,
      startTime: null,
    });
  },

  // ---- Data (optimistic updates + background DB writes) ----

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

    // Persist to Supabase (fire-and-forget)
    persistAnswer(user.id, answer);

    // Update completion percentage
    const percentage = get().getCompletionPercentage();
    const newProgress = { ...get().progress, overallCompletionPercentage: percentage, updatedAt: now };
    set({ progress: newProgress });
    persistProgress(user.id, newProgress, get().startTime);
  },

  getAnswer: (questionId) => {
    return get().answers[questionId]?.answerText || '';
  },

  setCurrentPosition: (level, sublevel, questionIndex) => {
    const { user, progress, startTime } = get();
    if (!user) return;

    const newProgress = {
      ...progress,
      currentLevel: level,
      currentSublevel: sublevel,
      currentQuestionIndex: questionIndex,
      updatedAt: new Date().toISOString(),
    };
    set({ progress: newProgress });
    persistProgress(user.id, newProgress, startTime);
  },

  completeLevel: (level) => {
    const { user, progress, startTime } = get();
    if (!user) return;

    const updates: Partial<Progress> = { updatedAt: new Date().toISOString() };
    if (level === '1') updates.level1Completed = true;
    if (level === '2') updates.level2Completed = true;
    if (level === '3') updates.level3Completed = true;
    if (level === 'boss') updates.bossCompleted = true;

    const newProgress = { ...progress, ...updates };
    newProgress.overallCompletionPercentage = get().getCompletionPercentage();
    set({ progress: newProgress });
    persistProgress(user.id, newProgress, startTime);
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
    const { user, answers, progress, startTime } = get();
    if (!user) return;

    // Collect question IDs to delete
    const toDelete = Object.keys(answers).filter(key => answers[key].level === level);
    const newAnswers = { ...answers };
    toDelete.forEach(key => delete newAnswers[key]);

    const updates: Partial<Progress> = {};
    if (level === '1') updates.level1Completed = false;
    if (level === '2') updates.level2Completed = false;
    if (level === '3') updates.level3Completed = false;
    if (level === 'boss') updates.bossCompleted = false;

    const newProgress = { ...progress, ...updates, updatedAt: new Date().toISOString() };
    set({ answers: newAnswers, progress: newProgress });
    persistProgress(user.id, newProgress, startTime);

    // Delete answers from Supabase
    if (toDelete.length > 0) {
      supabase
        .from('answers')
        .delete()
        .eq('user_id', user.id)
        .eq('level', level)
        .then(({ error }) => {
          if (error) console.error('Reset answers error:', error.message);
        });
    }
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

  // ---- Session bootstrap ----

  initSession: async () => {
    set({ isLoading: true });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      set({ isLoading: false });
      return;
    }

    const userId = session.user.id;
    const [profile, progressData, answers] = await Promise.all([
      loadUserProfile(userId),
      loadProgress(userId),
      loadAnswers(userId),
    ]);

    set({
      user: profile ?? {
        id: userId,
        email: session.user.email ?? '',
        displayName: session.user.user_metadata?.display_name ?? '',
        createdAt: session.user.created_at,
        lastLogin: new Date().toISOString(),
      },
      progress: progressData.progress,
      answers,
      isAuthenticated: true,
      isLoading: false,
      startTime: progressData.startTime,
    });
  },
}));
