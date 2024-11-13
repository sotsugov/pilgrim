import { create } from 'zustand';
import { Destination } from '../app/api/destinations/destination';

// Define a type for the state properties only
type GameStateData = {
  board: number;
  effects: string[];
  boardHistory: number[];
  optionHistory: number[];
  history: Destination[];
  isInitialState: boolean;
};

// Define a type for the store, including state and actions
type GameState = GameStateData & {
  // Actions
  setBoard: (board: number) => void;
  addEffect: (effect: string) => void;
  addToBoardHistory: (board: number) => void;
  addToOptionHistory: (option: number) => void;
  addToHistory: (item: Destination) => void;
  resetGame: () => void;
  setGameState: (gameState: Partial<GameStateData>) => void;
  getInitialState: () => GameStateData;
};

export const initialState: GameStateData = {
  board: 0,
  effects: [],
  boardHistory: [0],
  optionHistory: [],
  history: [],
  isInitialState: true,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  // Actions
  setBoard: (board) =>
    set((state) => ({
      board,
      isInitialState: board === 0 && state.history.length <= 1,
    })),

  addEffect: (effect) =>
    set((state) => ({
      effects: [...state.effects, effect],
      isInitialState: false,
    })),

  addToBoardHistory: (board) =>
    set((state) => ({
      boardHistory: [...state.boardHistory, board],
      isInitialState: false,
    })),

  addToOptionHistory: (option) =>
    set((state) => ({
      optionHistory: [...state.optionHistory, option],
      isInitialState: false,
    })),

  addToHistory: (item) =>
    set((state) => ({
      history: [...state.history, item],
      isInitialState: false,
    })),

  resetGame: () => set({ ...initialState }),

  setGameState: (gameState) =>
    set(() => ({
      ...initialState,
      ...gameState,
      isInitialState: false,
    })),

  getInitialState: () => {
    const state = get();
    // Return only the state properties, not the actions
    return {
      board: state.board,
      effects: state.effects,
      boardHistory: state.boardHistory,
      optionHistory: state.optionHistory,
      history: state.history,
      isInitialState: state.isInitialState,
    };
  },
}));
