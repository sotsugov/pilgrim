'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';
import { PilgrimIcon } from '@/components/logo';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const resetGame = useGameStore((state) => state.resetGame);

  const handleReset = () => {
    resetGame();
    router.push('/game');
  };

  return (
    <div className="flex flex-col">
      <header className="">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <PilgrimIcon className="h-12 w-12 text-muted" />
          </Link>
          <Button variant={'outline'} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
