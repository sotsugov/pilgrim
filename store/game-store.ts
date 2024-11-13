import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { gameData, Destination, Option } from '../lib/game-data';

interface GameState {
  board: number;
  effects: string[];
  boardHistory: number[];
  optionHistory: number[];
  steps: number;
}

interface GameStore extends GameState {
  currentDestination: Destination | undefined;
  setBoard: (board: number) => void;
  addEffect: (effect: string) => void;
  addEffects: (effects: string[]) => void;
  addBoardToHistory: (board: number) => void;
  addOptionToHistory: (option: number) => void;
  incrementSteps: () => void;
  resetGame: () => void;
  restoreGameState: (state: GameState) => void;
  canChooseOption: (option: Option) => boolean;
  chooseOption: (optionIndex: number) => void;
}

const initialState: GameState = {
  board: 0,
  effects: [],
  boardHistory: [],
  optionHistory: [],
  steps: 0,
};

const notFoundDestination: Destination = {
  id: -1,
  title: '404: Lost in the Void',
  description:
    'They who wander far from the herd, seeking truth in solitude, shall find that the abyss is not merely beneath them—it has become their constant companion, their mirror, their home.',
  options: [
    {
      text: 'Begin anew',
      destination: 0,
      requirements: [],
      effects: ['RESET'],
    },
  ],
  requirements: ['GAME OVER'],
  effects: [],
};

const gameOverDestination: Destination = {
  id: -2,
  title: 'The Void',
  description:
    'Where there is a beginning, there is an end. This is no exception...',
  options: [
    {
      text: 'Begin anew',
      destination: 0,
      requirements: [],
      effects: ['RESET'],
    },
  ],
  requirements: ['GAME OVER'],
  effects: [],
};

const journeyReflectionDestination: Destination = {
  id: -3,
  title: 'Echoes of the Past',
  description:
    'Your journey flashes before your eyes, each decision a stepping stone that led you here.',
  options: [
    {
      text: 'Begin anew',
      destination: 0,
      requirements: [],
      effects: ['RESET'],
    },
  ],
  requirements: [],
  effects: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentDestination: gameData.getDestination(0),

      setBoard: (board) =>
        set((state) => {
          const newDestination =
            gameData.getDestination(board) || notFoundDestination;
          const newEffects = [
            ...state.effects,
            ...(newDestination?.effects || []),
          ];
          const isGameOver = newEffects.includes('GAME OVER');
          return {
            board: isGameOver ? -2 : board,
            currentDestination: isGameOver
              ? gameOverDestination
              : newDestination,
            effects: newEffects,
          };
        }),

      addEffect: (effect) =>
        set((state) => {
          if (effect === 'RESET') {
            return {
              ...initialState,
              currentDestination: gameData.getDestination(0),
            };
          }
          const newEffects = [...state.effects, effect];
          const isGameOver = newEffects.includes('GAME OVER');
          return {
            effects: newEffects,
            currentDestination: isGameOver
              ? gameOverDestination
              : state.currentDestination,
            board: isGameOver ? -2 : state.board,
          };
        }),

      addEffects: (newEffects) =>
        set((state) => {
          if (newEffects.includes('RESET')) {
            return {
              ...initialState,
              currentDestination: gameData.getDestination(0),
            };
          }
          const updatedEffects = [...state.effects, ...newEffects];
          const isGameOver = updatedEffects.includes('GAME OVER');
          return {
            effects: updatedEffects,
            currentDestination: isGameOver
              ? gameOverDestination
              : state.currentDestination,
            board: isGameOver ? -2 : state.board,
          };
        }),

      addBoardToHistory: (board) =>
        set((state) => ({ boardHistory: [...state.boardHistory, board] })),

      addOptionToHistory: (option) =>
        set((state) => ({ optionHistory: [...state.optionHistory, option] })),

      incrementSteps: () => set((state) => ({ steps: state.steps + 1 })),

      resetGame: () =>
        set({
          ...initialState,
          currentDestination: gameData.getDestination(0),
        }),

      restoreGameState: (state) =>
        set({
          ...state,
          currentDestination: state.effects.includes('GAME OVER')
            ? gameOverDestination
            : gameData.getDestination(state.board) || notFoundDestination,
        }),

      canChooseOption: (option) => {
        const state = get();
        return gameData.checkRequirements(option.requirements, state.effects);
      },

      chooseOption: (optionIndex) => {
        const state = get();
        const option = state.currentDestination?.options[optionIndex];
        if (option && state.canChooseOption(option)) {
          if (option.effects.includes('RESET')) {
            set({
              ...initialState,
              currentDestination: gameData.getDestination(0),
            });
          } else if (option.destination === -3) {
            set({ currentDestination: journeyReflectionDestination });
          } else {
            state.setBoard(option.destination);
            state.addEffects(option.effects);
            state.addBoardToHistory(option.destination);
            state.addOptionToHistory(optionIndex);
            state.incrementSteps();
          }
        }
      },
    }),
    {
      name: 'pilgrim-game-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
