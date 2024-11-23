'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerButtonProps {
  destinationId: number;
}

export function AudioPlayerButton({ destinationId }: AudioPlayerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Stop playing when destination changes
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [destinationId]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (destinationId !== 1) return null;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <audio
        ref={audioRef}
        src={`/tts/destinations/${destinationId}.mp3`}
        onEnded={() => setIsPlaying(false)}
      />
    </>
  );
}
