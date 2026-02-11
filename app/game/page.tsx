'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSessionStore } from '@/store/session-store';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AudioPlayerButton } from '@/components/audio-player';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const sessionId = useSessionStore((state) => state.sessionId);
  const setSessionId = useSessionStore((state) => state.setSessionId);
  const clearSession = useSessionStore((state) => state.clearSession);
  const startSession = useMutation(api.engine.startSession);
  const chooseOption = useAction(api.engine.chooseOption);
  const warmCurrentScene = useAction(api.engine.warmCurrentScene);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [isWarming, setIsWarming] = useState(false);
  const [choiceWaitSeconds, setChoiceWaitSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastWarmKey, setLastWarmKey] = useState<string | null>(null);

  const sceneState = useQuery(
    api.engine.getCurrentScene,
    sessionId ? { sessionId } : 'skip',
  );

  useEffect(() => {
    if (!sessionId && !isBootstrapping) {
      setIsBootstrapping(true);
      startSession({})
        .then((newSessionId) => {
          setSessionId(newSessionId);
          setError(null);
        })
        .catch((caughtError) => {
          setError(
            caughtError instanceof Error ? caughtError.message : 'Error',
          );
        })
        .finally(() => setIsBootstrapping(false));
    }
  }, [isBootstrapping, sessionId, setSessionId, startSession]);

  useEffect(() => {
    if (sessionId && sceneState === null) {
      clearSession();
    }
  }, [clearSession, sceneState, sessionId]);

  const availableOptions = useMemo(() => {
    return sceneState?.scene.options ?? [];
  }, [sceneState]);

  const handleOptionClick = useCallback(
    async (optionIndex: number) => {
      if (!sessionId || isChoosing) {
        return;
      }

      setIsChoosing(true);
      setError(null);
      try {
        await chooseOption({
          sessionId,
          optionIndex,
        });
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Error');
      } finally {
        setIsChoosing(false);
      }
    },
    [chooseOption, isChoosing, sessionId],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = parseInt(event.key);
      if (!isNaN(key) && key > 0 && key <= availableOptions.length) {
        handleOptionClick(key - 1);
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

  useEffect(() => {
    if (!isChoosing) {
      setChoiceWaitSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setChoiceWaitSeconds(
        Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
      );
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, [isChoosing]);
  const legacyId =
    sceneState?.scene.kind === 'act1' ? sceneState.scene.legacyId : undefined;
  const sceneWarmKey =
    sessionId && sceneState
      ? `${sessionId}:${sceneState.session.steps}:${sceneState.scene.kind}:${
          sceneState.scene.kind === 'act1'
            ? sceneState.scene.legacyId
            : sceneState.scene.kind === 'act2'
              ? sceneState.scene.generatedNodeId
              : sceneState.scene.code
        }`
      : null;

  useEffect(() => {
    if (
      !sessionId ||
      !sceneState ||
      !sceneWarmKey ||
      sceneWarmKey === lastWarmKey
    ) {
      return;
    }

    let cancelled = false;
    setIsWarming(true);
    warmCurrentScene({ sessionId, maxOptions: 2 })
      .catch(() => {
        // Warmup is opportunistic; gameplay should continue if this fails.
      })
      .finally(() => {
        if (!cancelled) {
          setIsWarming(false);
        }
      });
    setLastWarmKey(sceneWarmKey);

    return () => {
      cancelled = true;
    };
  }, [lastWarmKey, sceneState, sceneWarmKey, sessionId, warmCurrentScene]);

  if (isBootstrapping || (sessionId && sceneState === undefined)) {
    return <div>Loading session...</div>;
  }

  if (!sessionId || !sceneState) {
    return <div>Preparing simulation...</div>;
  }

  if (error) {
    return (
      <div className="w-full mx-auto space-y-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl p-2">System Interference</CardTitle>
            <div className="p-2 break-words text-destructive">{error}</div>
          </CardHeader>
          <Separator />
          <CardFooter className="py-4">
            <Button
              variant="outline"
              onClick={() => {
                clearSession();
                setError(null);
              }}
            >
              Start New Session
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <Card className="w-full">
        <CardHeader>
          {sceneState.scene.title && (
            <CardTitle className="text-xl p-2">
              {sceneState.scene.title}
            </CardTitle>
          )}
          <div className="p-2 wrap-break-word">
            {sceneState.scene.description}
          </div>
          <div className="px-2 text-xs text-muted-foreground uppercase tracking-wide">
            {sceneState.scene.act === 'act1'
              ? 'Act I: Hand-authored'
              : sceneState.scene.act === 'act2'
                ? 'Act II: Generated'
                : 'Terminal'}
          </div>
          {isChoosing && (
            <div className="px-2 pt-2 text-xs text-muted-foreground animate-pulse">
              Generating next scene
              {choiceWaitSeconds > 0 ? `... ${choiceWaitSeconds}s` : '...'}
            </div>
          )}
          {isChoosing && choiceWaitSeconds >= 8 && (
            <div className="px-2 pt-1 text-xs text-amber-400">
              Still working. Advanced model responses can take 20-30 seconds.
            </div>
          )}
          {!isChoosing && isWarming && (
            <div className="px-2 pt-2 text-xs text-muted-foreground">
              Warming next branches...
            </div>
          )}
          {sceneState.scene.act === 'act2' &&
            sceneState.generation?.usedFallback && (
              <div className="px-2 pt-2 text-xs text-amber-400">
                Generation fallback active (
                {sceneState.generation.errorCode ?? 'unknown cause'}). Check
                Convex env keys/model if this persists.
              </div>
            )}
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
                  void handleOptionClick(index);
                }}
                className={`block w-full p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors duration-200 no-underline ${
                  isChoosing ? 'pointer-events-none opacity-60' : ''
                }`}
                scroll={false}
              >
                <div className="flex gap-1">
                  <span className="font-semibold shrink-0 inline-flex items-center justify-center size-6 text-foreground">
                    {index + 1}.
                  </span>
                  <div className="grow overflow-hidden">
                    {option.requirements.length > 0 && (
                      <span className="text-muted-foreground mr-1">
                        [{option.requirements.join(', ')}]
                      </span>
                    )}
                    <span className="wrap-break-word">{option.text}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between items-center py-4">
          <div className="text-muted items-start">
            <div>Steps: {sceneState.session.steps}</div>
            <div>Effects: {sceneState.session.effects.length}</div>
          </div>
          <AudioPlayerButton destinationId={legacyId} />
        </CardFooter>
      </Card>
    </div>
  );
}
