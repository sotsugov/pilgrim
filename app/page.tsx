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
    <div className="flex flex-col gap-6 row-start-2 items-center text-center">
      <div className="font-logo text-[6rem] -tracking-[0.5rem] [text-shadow:_0_0_2px_#ffffff,_0_0_5px_#6366f1]">
        PILGRIM
      </div>
      <div className="text-lg">
        Delve Deep. Decipher the Unknown. Determine Your Fate.
      </div>
      <div className="mx-auto max-w-2xl tracking-wide text-muted-foreground">
        In a world where the boundaries of reality are fragile, a series of
        unexplained disappearances beckons the brave to seek answers. Embark on
        a journey where every thread pulled can unravel a tapestry of truths or
        weave a web of deceit.
      </div>
      <div className="space-y-4">
        <Button size="lg" onClick={handleNewGame}>
          Begin New Game
        </Button>
        <form
          onSubmit={handleRestoreGame}
          className="flex flex-col items-center space-y-2"
        >
          <Input
            type="text"
            name="state"
            placeholder="Enter saved game code"
            className="w-64"
          />
          <Button type="submit" variant="outline">
            Restore Saved Game
          </Button>
        </form>
        {restoreError && (
          <div className="text-red-500 text-sm">{restoreError}</div>
        )}
      </div>
    </div>
  );
}
