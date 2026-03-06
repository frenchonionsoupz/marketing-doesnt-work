// Re-export types from store for backwards-compatibility
export type { UserProfile, GameAnswer, GameProgress } from '../store/gameStore';

export type LevelStatus = 'locked' | 'available' | 'completed';
