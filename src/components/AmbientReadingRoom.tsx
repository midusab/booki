/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { AMBIENT_TRACKS } from "../data";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Brain, 
  Headphones, 
  Sparkles,
  Info 
} from "lucide-react";

export const AmbientReadingRoom: React.FC = () => {
  // Pomodoro Focus Timer State
  const [timeLeft, setTimeLeft] = useState(1500); // 25 Min Default
  const [totalDuration, setTotalDuration] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  // Audio Mixer State
  const [activeTracks, setActiveTracks] = useState<Record<string, boolean>>({
    rain: false,
    fireplace: false,
    cafe: false,
  });
  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 0.5,
    fireplace: 0.3,
    cafe: 0.4,
  });

  // Audio HTML5 elements refs
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Clean initialization of audio stems
  useEffect(() => {
    AMBIENT_TRACKS.forEach((track) => {
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      audioRefs.current[track.id] = audio;
    });

    // Clean up all audio elements on unmount
    return () => {
      Object.keys(audioRefs.current).forEach((key) => {
        const audio = audioRefs.current[key];
        if (audio) {
          audio.pause();
        }
      });
    };
  }, []);

  // Update volumes & playing states when state changes
  useEffect(() => {
    Object.keys(activeTracks).forEach((id) => {
      const audio = audioRefs.current[id];
      if (audio) {
        if (activeTracks[id]) {
          audio.volume = volumes[id];
          // React to autoplay blocks gracefully
          audio.play().catch(() => {
            console.log("Audio playback was blocked on first load. Interact to play.");
          });
        } else {
          audio.pause();
        }
      }
    });
  }, [activeTracks, volumes]);

  // Handle Pomodoro countdown logic
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isRunning) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished, swap state or alarm
            setIsRunning(false);
            const nextMode = mode === "focus" ? "break" : "focus";
            const nextDuration = nextMode === "focus" ? 1500 : 300; // 5 mins break, 25 mins focus
            setMode(nextMode);
            setTotalDuration(nextDuration);
            // Quick web audio bell tone
            playCompletionChime();
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, mode]);

  // Gentle audio chime synth
  const playCompletionChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (err) {
      console.log("Chime synthetic failed to play due to audio context restrictions", err);
    }
  };

  // Helper formatting for timer digits
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rSecs.toString().padStart(2, "0")}`;
  };

  const toggleTrack = (id: string) => {
    setActiveTracks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleVolumeChange = (id: string, val: number) => {
    setVolumes((prev) => ({
      ...prev,
      [id]: val,
    }));
    // Live update direct audio element
    if (audioRefs.current[id]) {
      audioRefs.current[id].volume = val;
    }
  };

  const handleQuickTimer = (minutes: number) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
    setTotalDuration(minutes * 60);
  };

  const handleAddMinutes = (minDelta: number) => {
    setTimeLeft((prev) => {
      const next = Math.max(60, prev + minDelta * 60);
      setTotalDuration(next);
      return next;
    });
  };

  // Timer visual progress offset
  const circum = 2 * Math.PI * 90;
  const timerPerc = timeLeft / totalDuration;
  const strokeOffset = circum - circum * timerPerc;

  return (
    <div id="saga-ambient-reading-room" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch animate-fade-in">
      
      {/* Editorial Split: Left Side - Focus Timer block */}
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#E8EDE9] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E8EDE9] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#E8EDE9] px-2.5 py-1 rounded-full text-xxs tracking-wider text-[#5A7065] font-mono">
              {mode === "focus" ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
              <span>{mode === "focus" ? "CONCENTRATIVE FOCUS" : "TEA RETREAT"}</span>
            </div>
            <h3 className="text-xl font-serif text-[#2C1D11] font-semibold">The Pomodoro Hourglass</h3>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuickTimer(25)}
              type="button"
              className={`px-2.5 py-1 text-xxs font-mono rounded-lg transition-all ${
                totalDuration === 1500 ? "bg-[#2C1D11] text-[#FDFBF7]" : "hover:bg-[#F5EFEB] text-[#5A7065]"
              }`}
            >
              25m
            </button>
            <button
              onClick={() => handleQuickTimer(45)}
              type="button"
              className={`px-2.5 py-1 text-xxs font-mono rounded-lg transition-all ${
                totalDuration === 2700 ? "bg-[#2C1D11] text-[#FDFBF7]" : "hover:bg-[#F5EFEB] text-[#5A7065]"
              }`}
            >
              45m
            </button>
          </div>
        </div>

        {/* Elegant Dial Circular Progress */}
        <div className="my-10 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="90"
                className="stroke-[#F5EFEB]"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="90"
                className="stroke-[#5A7065]"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circum}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="text-center space-y-1 relative z-10">
              <span className="text-4xl font-serif font-black text-[#2C1D11] flex items-center justify-center font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xxs tracking-widest text-[#5A7065] font-mono block">
                {isRunning ? "SOUNDING EMBER" : "PAUSED"}
              </span>
            </div>
          </div>

          {/* Quick Adjustment Modifiers */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => handleAddMinutes(-5)}
              type="button"
              className="px-3 py-1.5 border border-[#E8EDE9] hover:bg-[#FDFBF7] text-xxs text-[#5A7065] rounded-xl font-mono transition-colors"
            >
              - 5 Min
            </button>
            <button
              onClick={() => handleAddMinutes(5)}
              type="button"
              className="px-3 py-1.5 border border-[#E8EDE9] hover:bg-[#FDFBF7] text-xxs text-[#5A7065] rounded-xl font-mono transition-colors"
            >
              + 5 Min
            </button>
          </div>
        </div>

        {/* Primary Command Strip */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            type="button"
            className={`flex-1 py-4.5 rounded-2xl font-semibold text-xs uppercase tracking-widest cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 ${
              isRunning 
                ? "bg-[#5A7065] text-[#FDFBF7] hover:bg-[#4A5D4E]" 
                : "bg-[#2C1D11] text-[#FDFBF7] hover:bg-[#1E100A]"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current text-white" />
                <span>Pause Solitude</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current text-white" />
                <span>Begin Solitude</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(totalDuration);
            }}
            type="button"
            className="p-4 rounded-2xl bg-[#F5EFEB] hover:bg-[#E8EDE9] text-[#2C1D11] transition-all cursor-pointer border border-[#D5DDD7]"
            title="Reset Hourglass"
          >
            <RotateCcw className="w-5 h-5 text-[#5A7065]" />
          </button>
        </div>
      </div>

      {/* Editorial Split: Right Side - Acoustic Mixer block */}
      <div className="bg-[#FDFBF7] p-8 md:p-10 rounded-3xl border border-[#E8EDE9] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-3xl">☕</span>
            <div>
              <h3 className="text-xl font-serif text-[#2C1D11] font-semibold">Sanctuary Studio Mixer</h3>
              <p className="text-xs text-[#5A7065]">Create a custom bespoke reading acoustics loop.</p>
            </div>
          </div>

          <div className="mt-2 text-xxs font-mono text-[#5A7065] bg-[#E8EDE9]/40 py-2 px-3.5 rounded-xl flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#5A7065] shrink-0" />
            <span>Mixer plays highly reliable, loopable public background stems safely.</span>
          </div>
        </div>

        {/* Mixer Stems Strip */}
        <div className="my-8 space-y-5">
          {AMBIENT_TRACKS.map((track) => {
            const isActive = activeTracks[track.id];
            return (
              <div 
                key={track.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  isActive 
                    ? "bg-white border-[#C5A03A]/20 shadow-xs ring-1 ring-[#C5A03A]/10" 
                    : "bg-white/40 border-[#E8EDE9] opacity-75"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl filter drop-shadow-xs">{track.icon}</span>
                    <div>
                      <h4 className="text-xs tracking-wide uppercase font-semibold text-[#2C1D11]">{track.title}</h4>
                      <p className="text-xxs text-[#5A7065]">{track.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTrack(track.id)}
                    type="button"
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#2C1D11] border-[#2C1D11] text-[#FDFBF7]"
                        : "bg-white border-[#E8EDE9] text-[#5A7065] hover:bg-[#FDFBF7]"
                    }`}
                  >
                    {isActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Individual Slider Column */}
                <div className="flex items-center gap-3">
                  <span className="text-XXXXS uppercase tracking-wider font-mono text-[#5A7065] w-8">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes[track.id]}
                    onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                    disabled={!isActive}
                    className="flex-1 accent-[#5A7065] h-1 bg-[#F5EFEB] rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-xxs font-mono text-[#5A7065] w-8 text-right">
                    {Math.round(volumes[track.id] * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ambient Prompt advice */}
        <div className="bg-white p-4.5 rounded-2xl border border-[#E8EDE9] flex items-center justify-between text-xxs">
          <div className="flex items-center gap-2 text-[#5A7065]">
            <Headphones className="w-4.5 h-4.5 text-[#C5A03A]" />
            <span>Select multiple tracks to mix soundscapes in unison.</span>
          </div>
          <div className="flex items-center gap-1 text-[#C5A03A]">
            <Sparkles className="w-3 h-3 text-[#C5A03A]" />
            <span className="font-semibold tracking-wider font-mono">LO-FI ATMOSPHERE</span>
          </div>
        </div>

      </div>
    </div>
  );
};
