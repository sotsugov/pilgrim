'use client';

import { useEffect, useState } from 'react';
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
  const [lastSavedState, setLastSavedState] = useState<string>('');

  const currentDestination = Destinations.find((dest) => dest.id === board);

  // Create current state string for comparison
  const currentStateString = JSON.stringify({
    board,
    effects,
    boardHistory,
    optionHistory,
    history,
  });

  // Check if state has changed since last save
  const hasStateChanged = currentStateString !== lastSavedState;

  useEffect(() => {
    if (currentDestination) {
      addToHistory(currentDestination);
    }
  }, [board, addToHistory, currentDestination]);

  const handleOptionClick = (option: Destination['options'][0]) => {
    setBoard(option.destination);
    addToBoardHistory(option.destination);
    addToOptionHistory(option.destination);
    option.effects.forEach((effect) => addEffect(effect));
    // Clear save ID when state changes
    setSaveId(null);
  };

  const handleSaveGame = async () => {
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
      console.error('Failed to save game:', error);
    }
  };

  // Check if all requirements are met for an option, hide it otherwise
  const meetsRequirements = (requirements: string[]) => {
    if (!requirements.length) return true;
    return requirements.every((req) => effects.includes(req));
  };

  if (!currentDestination) {
    return (
      <div className="container mx-auto p-4">
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
    <div className="container mx-auto p-4">
      <header className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline">Return to Main Page</Button>
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
            Restart Game
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {saveId && (
            <div className="text-sm text-muted-foreground">
              Save Code: <span className="font-mono">{saveId}</span>
            </div>
          )}
          <Button
            onClick={handleSaveGame}
            disabled={!hasStateChanged}
            title={
              !hasStateChanged ? 'Game state saved' : 'Save current game state'
            }
          >
            {!hasStateChanged ? 'Saved' : 'Save Game'}
          </Button>
        </div>
      </header>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {currentDestination.title || `Chapter ${board}`}
          </CardTitle>
          <CardDescription className="text-lg mb-4">
            {currentDestination.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentDestination.options
              .filter((option) => meetsRequirements(option.requirements))
              .map((option, index) => (
                <Link
                  key={index}
                  href={`#`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleOptionClick(option);
                  }}
                  className="block w-full p-3 rounded-md text-left text-base bg-gray-800/50 hover:bg-accent/80 hover:text-accent-foreground transition-colors duration-200 no-underline text-white/90 flex-col gap-1"
                  scroll={false}
                >
                  <div>
                    <span className="font-bold mr-2">{index + 1}.</span>
                    {option.requirements.length > 0 && (
                      <span className="text-sm text-emerald-400 mr-2">
                        [{option.requirements.join(', ')}]
                      </span>
                    )}
                    {option.text}
                  </div>
                </Link>
              ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="text-sm text-muted-foreground mb-2">
            Current effects: {effects.join(', ')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
