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
