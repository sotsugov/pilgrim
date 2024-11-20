'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';

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
      <header className="w-full p-2">
        <div className="container mx-auto p-6 flex justify-between items-center animate-fade-down">
          <Link href="/" className="flex items-center">
            <div className="font-semibold tracking-wide uppercase">Pilgrim</div>
          </Link>
          <Button variant={'outline'} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 animate-fade-up">
        {children}
      </main>
    </div>
  );
}
