"use client";
import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  text: string;
  persona: string;
  autoPlay?: boolean;
  className?: string;
}

const AudioPlayer = ({ text, persona, autoPlay = false, className = '' }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async () => {
    if (audioUrl) return audioUrl; // Return cached audio if available

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, persona }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return url;
    } catch (err) {
      setError('Failed to generate audio');
      console.error('Audio generation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async () => {
    const url = await generateAudio();
    if (url && audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !audioUrl && !isLoading) {
      playAudio();
    }
  }, [autoPlay, text, persona]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 text-xs ${className}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Audio unavailable</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <audio ref={audioRef} preload="none" />
      
      <button
        onClick={togglePlayback}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <span className="text-xs text-gray-500 hidden sm:inline">
        {isLoading ? 'Generating...' : isPlaying ? 'Playing' : 'Play audio'}
      </span>
    </div>
  );
};

export default AudioPlayer;
