'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const router = useRouter();
  const {
    setBoard,
    setEffects,
    setBoardHistory,
    setOptionHistory,
    setHistory,
    resetGame,
  } = useGameStore();
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleRestoreGame = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRestoreError(null);
    const formData = new FormData(event.currentTarget);
    const id = formData.get('state') as string;
    if (id) {
      try {
        const response = await fetch(`/api/gamestate?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to restore game state');
        }
        const { gameState } = await response.json();
        setBoard(gameState.board);
        setEffects(gameState.effects);
        setBoardHistory(gameState.boardHistory);
        setOptionHistory(gameState.optionHistory);
        setHistory(gameState.history);
        router.push('/game');
      } catch (error) {
        console.error('Failed to restore game state:', error);
        setRestoreError(
          'Failed to restore game state. Please check your save code.',
        );
      }
    } else {
      setRestoreError('Please enter a save code.');
    }
  };

  const handleNewGame = () => {
    resetGame();
    router.push('/game');
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col gap-6 items-center text-center">
        <div>
          <div className="font-logo text-[6rem] -tracking-[0.5rem] [text-shadow:_0_0_2px_#ffffff,_0_0_5px_#6366f1]">
            PILGRIM
          </div>
          <div className="text-xl">
            Delve Deep. Decipher the Unknown. Determine Your Fate.
          </div>
        </div>
        <div className="mx-auto max-w-2xl tracking-wide text-muted-foreground">
          In a world where the boundaries of reality are fragile, a series of
          unexplained disappearances beckons the brave to seek answers. Embark
          on a journey where every thread pulled can unravel a tapestry of
          truths or weave a web of deceit.
        </div>
        <div className="flex items-center">
          <Button size="lg" onClick={handleNewGame}>
            Begin New Game
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3 pt-6">
          <span className="text-muted">
            If you already have a save code, you can continue from the save
            point
          </span>
          <form
            onSubmit={handleRestoreGame}
            className="flex flex-row items-center space-x-2"
          >
            <Input
              type="text"
              name="state"
              placeholder="Enter game code"
              className="w-40"
            />
            <Button type="submit" variant="outline">
              Resume Game
            </Button>
          </form>
        </div>
        {restoreError && (
          <div className="text-destructive text-sm">{restoreError}</div>
        )}
      </div>
    </div>
  );
}
