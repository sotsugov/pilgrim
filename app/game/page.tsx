'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Destination } from '../api/destinations/destination';
import { getDestination } from '../api/destinations/getDestination';
import { Separator } from '@/components/ui/separator';
import { Clipboard, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function GameScreen() {
  const {
    board,
    effects,
    setBoard,
    addEffect,
    addToBoardHistory,
    addToOptionHistory,
    addToHistory,
    boardHistory,
    optionHistory,
    history,
    resetGame,
  } = useGameStore();

  const router = useRouter();
  const [currentDestination, setCurrentDestination] =
    useState<Destination | null>(null);
  const [saveId, setSaveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use ref to track if we should save
  const shouldSave = useRef(true);

  const copyToClipboard = useCallback(async () => {
    if (saveId) {
      await navigator.clipboard.writeText(saveId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [saveId]);

  // Fetch destination when board changes
  useEffect(() => {
    let isMounted = true;
    const fetchDestination = async () => {
      setIsLoading(true);
      try {
        const destination = await getDestination(board);
        if (isMounted) {
          setCurrentDestination(destination);
          addToHistory(destination);
        }
      } catch (error) {
        console.error('Failed to fetch destination:', error);
        if (isMounted) setCurrentDestination(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDestination();
    return () => {
      isMounted = false;
    };
  }, [board, addToHistory]);

  // Save game state
  useEffect(() => {
    if (!shouldSave.current) {
      shouldSave.current = true;
      return;
    }

    const saveGameState = async () => {
      setIsSaving(true);
      const gameState = {
        board,
        effects,
        boardHistory,
        optionHistory,
        history,
      };

      try {
        const response = await fetch('/api/gamestate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameState }),
        });

        const { id } = await response.json();
        setSaveId(id);
      } catch (error) {
        console.error('Failed to generate save code:', error);
      } finally {
        setIsSaving(false);
      }
    };

    saveGameState();
  }, [board, effects, boardHistory, optionHistory, history]);

  const meetsRequirements = useCallback(
    (requirements: string[]) => {
      if (!requirements.length) return true;
      return requirements.every((req) => effects.includes(req));
    },
    [effects],
  );

  const handleOptionClick = useCallback(
    (option: Destination['options'][0]) => {
      setBoard(option.destination);
      addToBoardHistory(option.destination);
      addToOptionHistory(option.destination);
      option.effects.forEach((effect) => addEffect(effect));
    },
    [setBoard, addToBoardHistory, addToOptionHistory, addEffect],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keyNumber = parseInt(event.key);
      if (!isNaN(keyNumber) && currentDestination) {
        const filteredOptions = currentDestination.options.filter((option) =>
          meetsRequirements(option.requirements),
        );
        const selectedOption = filteredOptions[keyNumber - 1];
        if (selectedOption) {
          handleOptionClick(selectedOption);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentDestination, meetsRequirements, handleOptionClick]);

  const handleRestart = useCallback(() => {
    shouldSave.current = false; // Prevent save on reset
    resetGame();
    setBoard(0);
    setSaveId(null);
    router.push('/');
  }, [resetGame, setBoard, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentDestination) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg mb-4">
              Destination not found. Please restart the game.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRestart}>Restart Game</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <header className="py-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center px-4">
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline">Return</Button>
          </Link>
          <Button variant="outline" onClick={handleRestart}>
            Restart
          </Button>
        </div>
      </header>

      <Card className="mx-4">
        <CardHeader className="space-y-4">
          <CardTitle className="text-muted-foreground tracking-normal">
            {currentDestination.title || ''}
          </CardTitle>
          <CardDescription className="text-base text-foreground">
            {currentDestination.description}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="w-full min-w-full">
          <div className="pt-4 space-y-2">
            {currentDestination.options
              .filter((option) => meetsRequirements(option.requirements))
              .map((option, index) => (
                <Link
                  key={index}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOptionClick(option);
                  }}
                  className="block w-full p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors duration-200 no-underline"
                  scroll={false}
                >
                  <div className="flex gap-2">
                    <span className="font-semibold flex-shrink-0 inline-flex items-center justify-center size-6 rounded-full bg-secondary text-foreground">
                      {index + 1}
                    </span>
                    <div className="flex-grow overflow-hidden">
                      {option.requirements.length > 0 && (
                        <span className="text-muted-foreground mr-1">
                          [{option.requirements.join(', ')}]
                        </span>
                      )}
                      <span className="break-words">{option.text}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-col items-start py-4">
          <div className="text-muted flex flex-row items-center justify-between gap-x-2">
            <div>Steps: {history.length - 1}</div>
            <span className="text-border">•</span>
            <div className="break-words">Effects: {effects.length}</div>
          </div>
          <div className="w-full flex items-center gap-x-2 mt-2">
            <span className="text-muted-foreground">Save Code:</span>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <Skeleton className="h-4 w-[64px]" />
              ) : (
                <span className="tracking-wide">{saveId}</span>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="h-6 w-6"
                onClick={copyToClipboard}
                disabled={isSaving || !saveId}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
                <span className="sr-only">Copy save code</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
