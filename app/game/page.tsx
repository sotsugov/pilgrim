'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Destinations } from '../api/destinations/getDestination';
import { Destination } from '../api/destinations/destination';
import { Separator } from '@/components/ui/separator';
import { Clipboard, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  const [saveId, setSaveId] = useState<string | null>(null);
  const [, setLastSavedState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (saveId) {
      await navigator.clipboard.writeText(saveId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentDestination = Destinations.find((dest) => dest.id === board);

  const currentStateString = JSON.stringify({
    board,
    effects,
    boardHistory,
    optionHistory,
    history,
  });

  // Automatically save and generate code when component mounts or board changes
  useEffect(() => {
    const generateSaveCode = async () => {
      setIsLoading(true);
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
        setLastSavedState(currentStateString);
      } catch (error) {
        console.error('Failed to generate save code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSaveCode();
  }, [
    board,
    effects,
    boardHistory,
    optionHistory,
    history,
    currentStateString,
  ]);

  // Wrap meetsRequirements in useCallback
  const meetsRequirements = useCallback(
    (requirements: string[]) => {
      if (!requirements.length) return true;
      return requirements.every((req) => effects.includes(req));
    },
    [effects],
  );

  // Wrap handleOptionClick in useCallback
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
    if (currentDestination) {
      addToHistory(currentDestination);
    }
  }, [board, addToHistory, currentDestination]);

  // Keyboard handler effect
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keyNumber = parseInt(event.key);
      if (!isNaN(keyNumber)) {
        const filteredOptions = currentDestination?.options.filter((option) =>
          meetsRequirements(option.requirements),
        );
        const selectedOption = filteredOptions?.[keyNumber - 1];
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
            <Button
              onClick={() => {
                resetGame();
                setBoard(0);
                setSaveId(null);
                setLastSavedState('');
              }}
            >
              Restart Game
            </Button>
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
          <Button
            variant="outline"
            onClick={() => {
              resetGame();
              setBoard(0);
              setSaveId(null);
              setLastSavedState('');
            }}
          >
            Restart
          </Button>
        </div>
      </header>

      <Card className="mx-4">
        <CardHeader className="space-y-4">
          <CardTitle className="text-muted-foreground tracking-normal">
            {currentDestination.title || `Fragment ${board}`}
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
                    <div>
                      {option.requirements.length > 0 && (
                        <span className="text-muted-foreground mr-1">
                          [{option.requirements.join(', ')}]
                        </span>
                      )}
                      {option.text}
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
          <div className="w-full flex items-center gap-x-2">
            <span className="text-muted-foreground">Save Code:</span>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-4 w-[64px]" />
              ) : (
                <span className="tracking-wide">{saveId}</span>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="h-6 w-6"
                onClick={copyToClipboard}
                disabled={isLoading || !saveId}
              >
                {copied ? <Check /> : <Clipboard />}
                <span className="sr-only">Copy save code</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
