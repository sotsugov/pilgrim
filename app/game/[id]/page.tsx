'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/game-store';
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
import { useRouter, useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';
import { Destination } from '@/app/api/destinations/destination';
import { getDestination } from '@/app/api/destinations/getDestination';

export default function GameScreen() {
  const router = useRouter();
  const params = useParams();
  let id = params.id;

  const [saveId, setSaveId] = useState<string | string[] | undefined>(id);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    isInitialState,
    setGameState,
  } = useGameStore();

  const [currentDestination, setCurrentDestination] =
    useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load game state from 'id' in the URL
  useEffect(() => {
    if (!saveId) {
      // If no 'id' is present, start a new game
      setIsLoading(false);
      setIsInitialLoad(false); // Initial load is complete
      return;
    }

    const fetchGameState = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/gamestate?id=${saveId}`);
        if (!response.ok) {
          throw new Error('Failed to load game state');
        }
        const { gameState } = await response.json();
        // Set the game state in the store
        setGameState(gameState);
      } catch (error) {
        console.error('Failed to load game state:', error);
        router.replace('/game'); // Redirect to new game
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false); // Initial load is complete
      }
    };

    fetchGameState();
  }, [saveId, setGameState, router]);

  // Function to save game state and update URL
  const saveGameState = useCallback(
    async (gameState: any) => {
      setIsSaving(true);
      try {
        let response;
        if (saveId) {
          // Update existing game state
          response = await fetch(`/api/gamestate?id=${saveId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameState }),
          });
          if (!response.ok) {
            throw new Error('Failed to update game state');
          }
        } else {
          // Create new game state
          response = await fetch('/api/gamestate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameState }),
          });
          const { id: newId } = await response.json();
          setSaveId(newId);
          router.replace(`/game/${newId}`); // Update the URL with new id
        }
      } catch (error) {
        console.error('Failed to save game state:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [router, saveId],
  );

  // Debounced version to prevent excessive saves
  const debouncedSaveGameState = useCallback(debounce(saveGameState, 500), [
    saveGameState,
  ]);

  const prevGameStateRef = useRef({
    board,
    effects,
    boardHistory,
    optionHistory,
    history,
  });

  // Save game state when it changes
  useEffect(() => {
    if (isInitialLoad || isInitialState) return; // Don't save during initial load or if in initial state

    const currentGameState = {
      board,
      effects,
      boardHistory,
      optionHistory,
      history,
    };

    if (isEqual(prevGameStateRef.current, currentGameState)) {
      return; // Game state hasn't changed, don't save
    }

    prevGameStateRef.current = currentGameState;
    debouncedSaveGameState(currentGameState);
  }, [
    board,
    effects,
    boardHistory,
    optionHistory,
    history,
    isInitialState,
    isInitialLoad,
    debouncedSaveGameState,
  ]);

  // Fetch the current destination when the board changes
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
        if (isMounted) {
          setCurrentDestination(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDestination();
    return () => {
      isMounted = false;
    };
  }, [board, addToHistory]);

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
      useGameStore.setState({ isInitialState: false });
    },
    [setBoard, addToBoardHistory, addToOptionHistory, addEffect],
  );

  const handleRestart = useCallback(() => {
    resetGame();
    setSaveId(undefined);
    router.replace('/game'); // Remove any 'id' from the URL
  }, [resetGame, router]);

  // Handle keyboard input to select options
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

  // Render loading state if necessary
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        {/* You can customize the loading skeleton here */}
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    );
  }

  // Render error state if currentDestination is null
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

  // Render the main game screen
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      {/* Header */}
      <header className="py-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center px-4">
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline">Return</Button>
          </Link>
          {!isInitialState && (
            <Button variant="outline" onClick={handleRestart}>
              Restart
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
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

        {/* Footer */}
        <CardFooter className="flex flex-col items-start py-4">
          <div className="text-muted flex flex-row items-center justify-between gap-x-2">
            <div>Steps: {Math.max(0, history.length - 1)}</div>
            <span className="text-border">•</span>
            <div className="break-words">Effects: {effects.length}</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
