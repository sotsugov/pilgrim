'use client';

import { useEffect } from 'react';
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
import { Destinations } from '../api/destinations/getDestination';

type Destination = {
  id: number;
  title?: string;
  description: string;
  options: {
    text: string;
    destination: number;
    requirements: string[];
    effects: string[];
  }[];
  requirements: string[];
  effects: string[];
};

export default function GameScreen() {
  const {
    board,
    effects,
    setBoard,
    addEffect,
    addToBoardHistory,
    addToOptionHistory,
    addToHistory,
  } = useGameStore();

  const currentDestination = Destinations.find((dest) => dest.id === board);

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
            <Button onClick={() => setBoard(0)}>Restart Game</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
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
            {currentDestination &&
              currentDestination.options &&
              currentDestination.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="w-full text-left justify-start h-auto whitespace-normal"
                  disabled={option.requirements.some(
                    (req) => !effects.includes(req),
                  )}
                >
                  {option.text}
                </Button>
              ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Current effects: {effects.join(', ')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
