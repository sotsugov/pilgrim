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
    <div className="flex flex-col gap-8 items-center justify-center text-center">
      <div className="bg-gradient-to-br from-muted-foreground to-foreground bg-clip-text text-7xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm uppercase">
        Pilgrim
      </div>
      <div className="text-xl text-muted-foreground">
        Delve Deep. Decipher the Unknown. Determine Your Fate.
      </div>

      <div className="text-muted tracking-wide">
        In a world where the boundaries of reality are fragile, a series of
        unexplained disappearances beckons the brave to seek answers. Embark on
        a journey where every thread pulled can unravel a tapestry of truths or
        weave a web of deceit.
      </div>
      <Button size="lg" onClick={handleNewGame}>
        Begin Anew
      </Button>
    </div>
  );
}
