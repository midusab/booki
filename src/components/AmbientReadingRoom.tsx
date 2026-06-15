/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Book } from "../types";
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
  Info,
  Check,
  Bookmark,
  Plus,
  BookOpen,
  Trophy,
  X
} from "lucide-react";

interface AmbientReadingRoomProps {
  books?: Book[];
  onUpdateBookProgress?: (id: string, currentPage: number) => void;
}

export const AmbientReadingRoom: React.FC<AmbientReadingRoomProps> = ({
  books = [],
  onUpdateBookProgress,
}) => {
  // Pomodoro Focus Timer State
  const [timeLeft, setTimeLeft] = useState(1500); // 25 Min Default
  const [totalDuration, setTotalDuration] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  // Selection & helper state for Pomodoro Reading Tracking
  const activeBooks = books.filter((b) => b.status === "In Progress");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [pagesReadInput, setPagesReadInput] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [lastCompletedSessionPages, setLastCompletedSessionPages] = useState("");
  const [sessionCompletedNotification, setSessionCompletedNotification] = useState("");

  // Initialize selected book
  useEffect(() => {
    if (activeBooks.length > 0 && !selectedBookId) {
      setSelectedBookId(activeBooks[0].id);
    }
  }, [activeBooks, selectedBookId]);

  // Selected book object lookup
  const selectedBook = activeBooks.find((b) => b.id === selectedBookId);

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
            
            // Pop up progress tracker logging helper automatically
            if (mode === "focus" && activeBooks.length > 0) {
              setShowLogModal(true);
            }
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, mode, activeBooks.length]);

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

  // Manual page submission flow
  const handleLogProgress = () => {
    if (!selectedBookId || !pagesReadInput) return;
    const pagesRead = parseInt(pagesReadInput);
    if (isNaN(pagesRead) || pagesRead <= 0) return;

    const currentBook = activeBooks.find((b) => b.id === selectedBookId);
    if (!currentBook) return;

    // Direct sum of pages or absolute page input resolution
    const updatedPage = Math.min(currentBook.totalPages, currentBook.currentPage + pagesRead);
    
    if (onUpdateBookProgress) {
      onUpdateBookProgress(selectedBookId, updatedPage);
      setSessionCompletedNotification(`Successfully logged +${pagesRead} pages for "${currentBook.title}"!`);
      setPagesReadInput("");
      
      // Auto fadeout banner
      setTimeout(() => {
        setSessionCompletedNotification("");
      }, 4000);
    }
  };

  // Modal final session submit flow
  const handleModalSessionLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !lastCompletedSessionPages) return;
    
    const pagesRead = parseInt(lastCompletedSessionPages);
    if (isNaN(pagesRead) || pagesRead <= 0) return;

    const currentBook = activeBooks.find((b) => b.id === selectedBookId);
    if (!currentBook) return;

    const updatedPage = Math.min(currentBook.totalPages, currentBook.currentPage + pagesRead);
    
    if (onUpdateBookProgress) {
      onUpdateBookProgress(selectedBookId, updatedPage);
      setSessionCompletedNotification(`Excellent focus! Added +${pagesRead} pages to "${currentBook.title}".`);
      setLastCompletedSessionPages("");
      setShowLogModal(false);
      
      setTimeout(() => {
        setSessionCompletedNotification("");
      }, 4000);
    }
  };

  // Timer visual progress offset
  const circum = 2 * Math.PI * 90;
  const timerPerc = timeLeft / totalDuration;
  const strokeOffset = circum - circum * timerPerc;

  return (
    <div id="saga-ambient-reading-room" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in relative">
      
      {/* Editorial Split: Left Column (Hoursglass & Reading Companion Card) */}
      <div className="flex flex-col gap-8">
        
        {/* Hourglass container */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#FFEBEB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#FFEBEB] pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#FFEBEB]/60 px-2.5 py-1 rounded-full text-xxs tracking-wider text-[#F40009] font-mono">
                {mode === "focus" ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                <span>{mode === "focus" ? "CONCENTRATIVE INTENSITY" : "TEA RETREAT"}</span>
              </div>
              <h3 className="text-xl font-serif text-[#1B0203] font-semibold font-serif">The Pomodoro Hourglass</h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuickTimer(25)}
                type="button"
                className={`px-3 py-1 text-xxs font-mono rounded-lg transition-all cursor-pointer ${
                  totalDuration === 1500 ? "bg-[#F40009] text-white" : "hover:bg-[#FFEBEB]/40 text-[#F40009]"
                }`}
              >
                25m
              </button>
              <button
                onClick={() => handleQuickTimer(45)}
                type="button"
                className={`px-3 py-1 text-xxs font-mono rounded-lg transition-all cursor-pointer ${
                  totalDuration === 2700 ? "bg-[#F40009] text-white" : "hover:bg-[#FFEBEB]/40 text-[#F40009]"
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
                  className="stroke-[#FFEBEB]"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  className="stroke-[#F40009]"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circum}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="text-center space-y-1 relative z-10">
                <span className="text-4xl font-serif font-black text-[#1B0203] flex items-center justify-center font-mono">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xxs tracking-widest text-gray-500 font-mono block">
                  {isRunning ? "SOUNDING EMBER" : "PAUSED"}
                </span>
              </div>
            </div>

            {/* Quick Adjustment Modifiers */}
            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={() => handleAddMinutes(-5)}
                type="button"
                className="px-3 py-1.5 border border-[#FFEBEB] hover:bg-[#FFEBEB]/20 text-xxs text-[#F40009] rounded-xl font-mono transition-colors cursor-pointer"
              >
                - 5 Min
              </button>
              <button
                onClick={() => handleAddMinutes(5)}
                type="button"
                className="px-3 py-1.5 border border-[#FFEBEB] hover:bg-[#FFEBEB]/20 text-xxs text-[#F40009] rounded-xl font-mono transition-colors cursor-pointer"
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
              className={`flex-1 py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2 ${
                isRunning 
                  ? "bg-gray-700 text-white hover:bg-gray-800" 
                  : "bg-[#F40009] text-white hover:bg-[#B80006]"
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
              className="p-4 rounded-2xl bg-[#FFEBEB]/50 hover:bg-[#FFEBEB] text-[#F40009] transition-all cursor-pointer border border-[#FFEBEB]"
              title="Reset Hourglass"
            >
              <RotateCcw className="w-5 h-5 text-[#F40009]" />
            </button>
          </div>
        </div>

        {/* Dynamic Focus Companion card (Only shows when books are in progress) */}
        {activeBooks.length > 0 && (
          <div className="bg-[#1B0203] text-[#FFFDF9] p-8 rounded-3xl border border-[#F40009]/20 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-5 h-5 text-[#F40009]" />
                  <h4 className="text-sm tracking-wide font-serif font-bold text-[#FFFDF9]">Active Focus Reading</h4>
                </div>
                <BookOpen className="w-4 h-4 text-red-400" />
              </div>

              <p className="text-xxs text-gray-400 leading-relaxed">
                Connect your deep solitude timers directly with your reading logs. Select your current book and record pages read after concentrating.
              </p>

              {/* Book selector select menu dropdown */}
              <div className="space-y-1.5 mt-2">
                <label className="text-xxxxs uppercase tracking-wider text-red-300 font-mono block">Selected Companion Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full bg-[#301012] border border-[#F40009]/30 rounded-xl px-3.5 py-3 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#F40009] transition-all cursor-pointer"
                >
                  {activeBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.author})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Book Detail Display Area */}
              {selectedBook && (
                <div className="bg-[#301012]/40 rounded-2xl p-4.5 border border-[#F40009]/10 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedBook.coverImage} 
                      alt={selectedBook.title}
                      className="w-10 h-14 object-cover rounded-md shadow-md border border-[#F40009]/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xxxxs font-mono text-[#F40009] uppercase block tracking-wider">Current reading page</span>
                      <h5 className="text-xs font-serif font-bold text-white truncate">{selectedBook.title}</h5>
                      <span className="text-xxxxs text-gray-400 block mt-0.5">Author: {selectedBook.author}</span>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xxxxs font-mono text-gray-400">
                      <span>Progress: {Math.round((selectedBook.currentPage / selectedBook.totalPages) * 100)}%</span>
                      <span className="text-[#F40009] font-semibold">{selectedBook.currentPage} / {selectedBook.totalPages} pgs</span>
                    </div>
                    <div className="w-full h-1 bg-[#1A0A0B] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#F40009]" 
                        style={{ width: `${Math.min(100, (selectedBook.currentPage / selectedBook.totalPages) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Incremental logger form */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="col-span-2 relative">
                  <input
                    type="number"
                    placeholder="Pages completed..."
                    value={pagesReadInput}
                    onChange={(e) => setPagesReadInput(e.target.value)}
                    className="w-full bg-[#301012] border border-[#F40009]/30 rounded-xl pl-3.5 pr-8 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F40009]"
                  />
                  <span className="absolute right-3.5 top-3 text-xxxxs font-mono text-red-300">PGS</span>
                </div>
                
                <button
                  onClick={handleLogProgress}
                  type="button"
                  className="bg-[#F40009] hover:bg-[#B80006] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer py-3"
                  title="Inscribe page count manually"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Editorial Split: Right Column (Studio Mixer Mixer controls) */}
      <div className="bg-[#FDFBF7] p-8 md:p-10 rounded-3xl border border-[#FFEBEB] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-3xl">☕</span>
            <div>
              <h3 className="text-xl font-serif text-[#1B0203] font-semibold font-serif">Sanctuary Studio Mixer</h3>
              <p className="text-xs text-gray-500">Create a custom bespoke reading acoustics loop.</p>
            </div>
          </div>

          <div className="mt-2 text-xxs font-mono text-[#F40009] bg-[#FFEBEB]/40 py-2 px-3.5 rounded-xl flex items-center gap-2 border border-[#FFEBEB]">
            <Info className="w-3.5 h-3.5 text-[#F40009] shrink-0" />
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
                    ? "bg-white border-[#F40009]/20 shadow-xs ring-1 ring-[#F40009]/10" 
                    : "bg-white/40 border-[#FFEBEB] opacity-75"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl filter drop-shadow-xs">{track.icon}</span>
                    <div>
                      <h4 className="text-xs tracking-wide uppercase font-semibold text-[#1B0203]">{track.title}</h4>
                      <p className="text-xxs text-gray-500">{track.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTrack(track.id)}
                    type="button"
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#1B0203] border-[#1B0203] text-white"
                        : "bg-white border-[#FFEBEB] text-[#F40009] hover:bg-[#FFEBEB]/20"
                    }`}
                  >
                    {isActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Individual Slider Column */}
                <div className="flex items-center gap-3">
                  <span className="text-XXXXS uppercase tracking-wider font-mono text-[#F40009] w-8">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes[track.id]}
                    onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                    disabled={!isActive}
                    className="flex-1 accent-[#F40009] h-1 bg-[#FFEBEB] rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-xxs font-mono text-[#F40009] w-8 text-right">
                    {Math.round(volumes[track.id] * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ambient Prompt advice */}
        <div className="bg-white p-4.5 rounded-2xl border border-[#FFEBEB] flex items-center justify-between text-xxs">
          <div className="flex items-center gap-2 text-gray-500">
            <Headphones className="w-4.5 h-4.5 text-[#F40009]" />
            <span>Select multiple tracks to mix soundscapes in unison.</span>
          </div>
          <div className="flex items-center gap-1 text-[#F40009]">
            <Sparkles className="w-3 h-3 text-[#F40009]" />
            <span className="font-semibold tracking-wider font-mono">LO-FI ATMOSPHERE</span>
          </div>
        </div>

      </div>

      {/* Floating Global Page Log Action Success Notification Banner */}
      {sessionCompletedNotification && (
        <div className="fixed bottom-6 right-6 bg-[#1B0203] text-white border border-[#F40009]/30 rounded-2xl px-5 py-4 shadow-xl z-50 flex items-center gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-[#F40009]/20 flex items-center justify-center text-[#F40009]">
            <Check className="w-4.5 h-4.5 text-[#F40009]" />
          </div>
          <div>
            <span className="text-xxs font-semibold font-mono text-[#FFEBEB] block uppercase tracking-wider">Tracker Updated</span>
            <p className="text-xs text-white font-medium">{sessionCompletedNotification}</p>
          </div>
        </div>
      )}

      {/* Session Complete Interactive Overlap Modal Popup */}
      {showLogModal && (
        <div className="fixed inset-0 bg-[#1B0203]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-7 border border-[#FFEBEB] shadow-2xl relative animate-scale-up">
            
            {/* Close trigger button */}
            <button
              onClick={() => setShowLogModal(false)}
              type="button"
              className="absolute top-5 right-5 text-gray-400 hover:text-[#1B0203] p-1 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              title="Dismiss tracker popup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-[#FFEBEB] text-[#F40009] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-7 h-7 text-[#F40009]" />
              </div>
              
              <div className="space-y-1">
                <span className="text-xxs font-mono text-[#F40009] tracking-wider uppercase block">Focus block complete</span>
                <h3 className="text-lg font-serif font-bold text-[#1B0203]">Solitude Focus Achieved!</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-2">
                  Fantastic discipline. You completed 25 minutes of quiet, dedicated reading. Log your page accomplishment below:
                </p>
              </div>

              {/* Inner details form */}
              <form onSubmit={handleModalSessionLogSubmit} className="space-y-4 pt-2 text-left">
                {/* Book selection check */}
                <div className="space-y-1">
                  <label className="text-xxxxs font-mono text-gray-400 uppercase tracking-widest block">Apply log to Book</label>
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#FFEBEB] rounded-xl px-3 py-3.5 text-xs text-[#1B0203] focus:outline-none focus:border-[#F40009] cursor-pointer"
                  >
                    {activeBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.author})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Input form details */}
                <div className="space-y-1">
                  <label className="text-xxxxs font-mono text-gray-400 uppercase tracking-widest block">Deed Details (Pages Completed)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15"
                      min="1"
                      value={lastCompletedSessionPages}
                      onChange={(e) => setLastCompletedSessionPages(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#FFEBEB] rounded-xl pl-3.5 pr-14 py-3.5 text-xs text-[#1B0203] placeholder-gray-400 focus:outline-none focus:border-[#F40009]"
                    />
                    <span className="absolute right-4 top-3.5 text-xxxxs font-mono text-gray-400">PAGES</span>
                  </div>
                </div>

                {/* Submit / Skip buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setShowLogModal(false)}
                    type="button"
                    className="border border-[#FFEBEB] text-gray-500 hover:bg-gray-50 rounded-xl font-semibold text-xs py-3.5 cursor-pointer text-center transition-all"
                  >
                    Skip Logging
                  </button>
                  <button
                    type="submit"
                    className="bg-[#F40009] hover:bg-[#B80006] text-white font-semibold text-xs rounded-xl py-3.5 cursor-pointer text-center transition-all shadow-md"
                  >
                    Inscribe Deed
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
