import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Id } from '@/convex/_generated/dataModel';

interface SessionStore {
  sessionId: Id<'sessions'> | null;
  setSessionId: (sessionId: Id<'sessions'>) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (sessionId) => set({ sessionId }),
      clearSession: () => set({ sessionId: null }),
    }),
    {
      name: 'pilgrim-session-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
