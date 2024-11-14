'use client';

import { useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/game-store';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function GamePage() {
  const { board, currentDestination, setBoard, effects, steps, chooseOption } =
    useGameStore();

  useEffect(() => {
    if (board === 0 && !currentDestination) {
      setBoard(0);
    }
  }, [board, currentDestination, setBoard]);

  const meetsRequirements = useCallback(
    (requirements: string[]) => {
      if (requirements.length === 0) return true;
      return requirements.some((req) => effects.includes(req));
    },
    [effects],
  );

  const availableOptions = useMemo(() => {
    return (
      currentDestination?.options.filter((option) =>
        meetsRequirements(option.requirements),
      ) || []
    );
  }, [currentDestination, meetsRequirements]);

  const handleOptionClick = useCallback(
    (option: { destination: number; effects: string[] }) => {
      if (currentDestination) {
        const optionIndex = currentDestination.options.findIndex(
          (o) => o === option,
        );
        chooseOption(optionIndex);
      }
    },
    [chooseOption, currentDestination],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = parseInt(event.key);
      if (!isNaN(key) && key > 0 && key <= availableOptions.length) {
        handleOptionClick(availableOptions[key - 1]);
      }
    },
    [availableOptions, handleOptionClick],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!currentDestination) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full mx-auto px-4">
      <Card className="w-full">
        <CardHeader>
          {currentDestination.title && (
            <CardTitle className="text-xl mb-4">
              {currentDestination.title}
            </CardTitle>
          )}
          <div>{currentDestination.description}</div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 mt-6">
          <div className="space-y-2">
            {availableOptions.map((option, index) => (
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
                        [
                        {option.requirements
                          .filter((req) => effects.includes(req))
                          .join(', ')}
                        ]
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
        <CardFooter className="flex py-4">
          <div className="text-muted items-start">
            <div>Steps: {steps}</div>
            <div>Effects: {effects.length}</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
