'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';

export default function Home() {
  const router = useRouter();
  const resetGame = useGameStore((state) => state.resetGame);

  const handleNewGame = () => {
    resetGame();
    router.push('/game');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-6 items-center text-center p-6">
        <div>
          <div className="font-logo text-[6rem] -tracking-[0.5rem] [text-shadow:_0_0_2px_#ffffff,_0_0_5px_#6366f1]">
            PILGRIM
          </div>
          <div className="text-xl">
            Delve Deep. Decipher the Unknown. Determine Your Fate.
          </div>
        </div>
        <div className="mx-auto max-w-[80ch] tracking-wide text-muted">
          In a world where the boundaries of reality are fragile, a series of
          unexplained disappearances beckons the brave to seek answers. Embark
          on a journey where every thread pulled can unravel a tapestry of
          truths or weave a web of deceit.
        </div>
        <div className="flex items-center">
          <Button size="lg" onClick={handleNewGame}>
            Begin Anew
          </Button>
        </div>
      </div>
    </div>
  );
}
