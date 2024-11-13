'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';

export default function Home() {
  const router = useRouter();
  const { resetGame, getInitialState } = useGameStore();
  const [isStarting, setIsStarting] = useState(false);

  const handleNewGame = async () => {
    setIsStarting(true);
    try {
      resetGame();
      const initialGameState = getInitialState();

      const response = await fetch('/api/gamestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState: initialGameState }),
      });

      if (!response.ok) {
        throw new Error('Failed to start a new game.');
      }

      const { id: newId } = await response.json();

      router.push(`/game/${newId}`);
    } catch (error) {
      console.error('Failed to start a new game:', error);
      // Optionally, handle the error (e.g., show an error message)
    } finally {
      setIsStarting(false);
    }
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
          <Button
            size="lg"
            onClick={handleNewGame}
            disabled={isStarting}
            className="transition-all"
          >
            {isStarting ? 'Starting...' : 'Begin New Game'}
          </Button>
        </div>
      </div>
    </div>
  );
}
