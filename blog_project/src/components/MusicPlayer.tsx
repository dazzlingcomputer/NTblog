import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Music,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useBlog } from '../contexts/BlogContext';
import { MusicTrack } from '../types';

interface MusicPlayerProps {
  className?: string;
}

export function MusicPlayer({ className = '' }: MusicPlayerProps) {
  const { state, dispatch } = useBlog();
  const { 
    musicTracks, 
    currentTrack, 
    isPlaying, 
    siteSettings: { musicSettings },
    currentTheme 
  } = state;
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(musicSettings.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 播放模式：sequence (顺序), loop (循环), random (随机)
  const [playMode, setPlayMode] = useState<'sequence' | 'loop' | 'random'>(musicSettings.playMode);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    
    // 更新设置
    dispatch({
      type: 'UPDATE_SITE_SETTINGS',
      payload: {
        musicSettings: {
          ...musicSettings,
          volume
        }
      }
    });
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!currentTrack && musicTracks.length > 0) {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: musicTracks[0] });
      dispatch({ type: 'SET_PLAYING', payload: true });
    } else {
      dispatch({ type: 'SET_PLAYING', payload: !isPlaying });
    }
  };

  const handleNext = () => {
    if (musicTracks.length === 0) return;

    const currentIndex = musicTracks.findIndex(track => track.id === currentTrack?.id);
    let nextIndex;

    switch (playMode) {
      case 'random':
        nextIndex = Math.floor(Math.random() * musicTracks.length);
        break;
      case 'loop':
        nextIndex = currentIndex;
        break;
      default: // sequence
        nextIndex = (currentIndex + 1) % musicTracks.length;
    }

    dispatch({ type: 'SET_CURRENT_TRACK', payload: musicTracks[nextIndex] });
    dispatch({ type: 'SET_PLAYING', payload: true });
  };

  const handlePrevious = () => {
    if (musicTracks.length === 0) return;

    const currentIndex = musicTracks.findIndex(track => track.id === currentTrack?.id);
    let prevIndex;

    switch (playMode) {
      case 'random':
        prevIndex = Math.floor(Math.random() * musicTracks.length);
        break;
      case 'loop':
        prevIndex = currentIndex;
        break;
      default: // sequence
        prevIndex = (currentIndex - 1 + musicTracks.length) % musicTracks.length;
    }

    dispatch({ type: 'SET_CURRENT_TRACK', payload: musicTracks[prevIndex] });
    dispatch({ type: 'SET_PLAYING', payload: true });
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(musicSettings.volume || 0.7);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const cyclePlayMode = () => {
    const modes: ('sequence' | 'loop' | 'random')[] = ['sequence', 'loop', 'random'];
    const currentIndex = modes.indexOf(playMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setPlayMode(nextMode);
    
    dispatch({
      type: 'UPDATE_SITE_SETTINGS',
      payload: {
        musicSettings: {
          ...musicSettings,
          playMode: nextMode
        }
      }
    });
  };

  if (!musicSettings.isEnabled || musicTracks.length === 0) {
    return null;
  }

  const PlayModeIcon = () => {
    switch (playMode) {
      case 'loop':
        return <Repeat1 size={16} />;
      case 'random':
        return <Shuffle size={16} />;
      default:
        return <Repeat size={16} />;
    }
  };

  return (
    <>
      {/* Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          preload="metadata"
        />
      )}

      {/* Music Player */}
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        <div className={`rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ${
          currentTheme === 'dark' 
            ? 'bg-gray-800/90 border border-gray-700' 
            : 'bg-white/90 border border-gray-200'
        } ${isExpanded ? 'w-80' : 'w-16'}`}>
          
          {/* Compact Mode */}
          {!isExpanded && (
            <div className="p-4">
              <button
                onClick={() => setIsExpanded(true)}
                className={`p-2 rounded-full transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Music size={20} />
              </button>
            </div>
          )}

          {/* Expanded Mode */}
          {isExpanded && (
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music size={18} className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
                  <span className={`text-sm font-medium ${
                    currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    音乐播放器
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className={`p-1 rounded transition-colors ${
                    currentTheme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Current Track Info */}
              {currentTrack && (
                <div className="text-center">
                  <h3 className={`text-sm font-medium truncate ${
                    currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {currentTrack.title}
                  </h3>
                  <p className={`text-xs truncate ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {currentTrack.artist}
                  </p>
                </div>
              )}

              {/* Progress Bar */}
              {currentTrack && (
                <div className="space-y-1">
                  <div 
                    className={`h-2 rounded-full cursor-pointer ${
                      currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className={`flex justify-between text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={cyclePlayMode}
                  className={`p-2 rounded-full transition-colors ${
                    currentTheme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title={`播放模式: ${playMode === 'sequence' ? '顺序' : playMode === 'loop' ? '单曲循环' : '随机'}`}
                >
                  <PlayModeIcon />
                </button>

                <button
                  onClick={handlePrevious}
                  disabled={musicTracks.length === 0}
                  className={`p-2 rounded-full transition-colors ${
                    musicTracks.length === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : currentTheme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <SkipBack size={20} />
                </button>

                <button
                  onClick={handlePlayPause}
                  disabled={musicTracks.length === 0}
                  className={`p-3 rounded-full transition-all ${
                    musicTracks.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
                  } text-white`}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  onClick={handleNext}
                  disabled={musicTracks.length === 0}
                  className={`p-2 rounded-full transition-colors ${
                    musicTracks.length === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : currentTheme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <SkipForward size={20} />
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className={`p-1 rounded transition-colors ${
                      currentTheme === 'dark'
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
