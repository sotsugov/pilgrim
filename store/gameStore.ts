import { create } from 'zustand';

type GameState = {
  board: number;
  step: number;
  effects: string[];
  boardHistory: number[];
  optionHistory: number[];
  history: Record<string, any>[];
  setBoard: (board: number) => void;
  setStep: (step: number) => void;
  setEffects: (effects: string[]) => void;
  setBoardHistory: (boardHistory: number[]) => void;
  setOptionHistory: (optionHistory: number[]) => void;
  setHistory: (history: Record<string, any>[]) => void;
  addEffect: (effect: string) => void;
  addToBoardHistory: (board: number) => void;
  addToOptionHistory: (option: number) => void;
  addToHistory: (item: Record<string, any>) => void;
  resetGame: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  board: 0,
  step: 0,
  effects: [],
  boardHistory: [0],
  optionHistory: [0],
  history: [{}],
  setBoard: (board) => set({ board }),
  setStep: (step) => set({ step }),
  setEffects: (effects) => set({ effects }),
  setBoardHistory: (boardHistory) => set({ boardHistory }),
  setOptionHistory: (optionHistory) => set({ optionHistory }),
  setHistory: (history) => set({ history }),
  addEffect: (effect) =>
    set((state) => ({ effects: [...state.effects, effect] })),
  addToBoardHistory: (board) =>
    set((state) => ({ boardHistory: [...state.boardHistory, board] })),
  addToOptionHistory: (option) =>
    set((state) => ({ optionHistory: [...state.optionHistory, option] })),
  addToHistory: (item) =>
    set((state) => ({ history: [...state.history, item] })),
  resetGame: () =>
    set({
      board: 0,
      step: 0,
      effects: [],
      boardHistory: [0],
      optionHistory: [0],
      history: [{}],
    }),
}));
