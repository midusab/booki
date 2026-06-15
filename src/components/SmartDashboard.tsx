/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Book, ReadingBadge } from "../types";
import { MOTIVATIONAL_QUOTES, SCHED_MEETING } from "../data";
import { 
  Flame, 
  Sparkles, 
  Award, 
  Calendar, 
  Compass, 
  Plus, 
  Check, 
  BookOpen, 
  Layers, 
  Clock 
} from "lucide-react";

interface SmartDashboardProps {
  readingStreak: number;
  dailyStreakGoal: number;
  dailyPagesRead: number;
  setDailyPagesRead: (pages: number | ((prev: number) => number)) => void;
  incrementStreak: () => void;
  books: Book[];
  badges: ReadingBadge[];
  onUnlockBadge: (id: string) => void;
}

export const SmartDashboard: React.FC<SmartDashboardProps> = ({
  readingStreak,
  dailyPagesRead,
  setDailyPagesRead,
  incrementStreak,
  books,
  badges,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const targetPages = 30; // standard daily reading goal in Saga

  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  // Calculate stats
  const booksInProgress = books.filter((b) => b.status === "In Progress").length;
  const booksCompleted = books.filter((b) => b.status === "Completed").length;
  const progressPercent = Math.min(100, Math.round((dailyPagesRead / targetPages) * 100));

  const handleAddPages = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyPagesRead((prev) => {
        const next = prev + parsed;
        if (next >= targetPages) {
          // Trigger streak increment if goal is hit
          incrementStreak();
        }
        return next;
      });
      setPageInput("");
    }
  };

  return (
    <div id="saga-smart-dashboard" className="space-y-8 animate-fade-in">
      {/* Editorial Welcome Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1E100A] to-[#2C1D11] text-[#FDFBF7] p-8 rounded-3xl shadow-xl flex flex-col justify-between border border-[#C5A03A]/20 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#C4A03A]/10 blur-3xl"></div>
          
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#C5A03A]/20 text-[#EADEBE] px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide border border-[#C5A03A]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE DAILY DEVOTION</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-light leading-snug tracking-tight text-[#FFFDF9]">
              “{currentQuote.text}”
            </h1>
            <p className="text-xs tracking-wider uppercase text-[#EADEBE]/70 font-medium italic">
              — {currentQuote.author}
            </p>
          </div>

          <div className="mt-8 flex justify-between items-center relative z-10 border-t border-[#FFFDF9]/10 pt-4">
            <span className="text-xs text-[#EADEBE]/50 font-mono">ESTABLISHED IN THE SANCTUARY</span>
            <button 
              onClick={rotateQuote}
              type="button"
              className="text-xs text-[#FFFDF9] hover:text-[#C5A03A] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Meditate Next Quote</span>
            </button>
          </div>
        </div>

        {/* Dynamic Reading Streak Gauge Card */}
        <div className="bg-white p-8 rounded-3xl shadow-md border border-[#E8EDE9] flex flex-col justify-between justify-items-stretch relative">
          <div className="absolute right-4 top-4 text-[#C5A03A]">
            <Flame className="w-6 h-6 fill-current animate-pulse text-[#C5A03A]" />
          </div>

          <div className="space-y-2">
            <span className="text-xxs tracking-widest text-[#5A7065] uppercase font-mono block">MEMBER DILIGENCE</span>
            <h2 className="text-2xl font-serif text-[#2C1D11] font-semibold">Active Sanctuary Streak</h2>
            <p className="text-sm text-[#5A7065]">Keep your flame burning bright by meeting your daily goal.</p>
          </div>

          <div className="my-6 flex items-center justify-center gap-4">
            <div className="text-center">
              <span className="text-5xl font-serif text-[#2C1D11] block font-bold tracking-tight">
                {readingStreak}
              </span>
              <span className="text-xs tracking-wider uppercase text-[#5A7065] font-semibold">Days Active</span>
            </div>
            <div className="h-10 w-px bg-[#E8EDE9]"></div>
            <div className="text-sm text-[#2C1D11] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#5A7065]">
                <Check className="w-3.5 h-3.5 text-[#5A7065]" />
                <span>Goal: {targetPages} pages / day</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#5A7065]">
                <Check className="w-3.5 h-3.5 text-[#5A7065]" />
                <span>Next Badge: {readingStreak >= 5 ? "Page Monarch" : "5 Days Devotee"}</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#FDFBF7] p-2 rounded-2xl border border-[#E8EDE9] flex justify-between items-center text-xs">
            <span className="text-[#5A7065] font-mono">Streak Flame Strength:</span>
            <span className="text-[#C5A03A] font-semibold tracking-wider font-mono">
              {readingStreak > 0 ? "🔥 ".repeat(Math.min(3, Math.ceil(readingStreak / 3))) + "Pristine" : "❄️ Dormant"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Quick Log Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Daily Progress Widget */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-[#E8EDE9] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-semibold text-[#2C1D11]">Today's Progress Gauge</h3>
            <span className="text-xs tracking-widest text-[#5A7065] uppercase font-mono">Goal: {targetPages}p</span>
          </div>

          <div className="my-6 relative flex justify-center items-center">
            {/* Elegant SVG Progress Indicator */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-[#F5EFEB]"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-[#5A7065]"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * progressPercent) / 100}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>
            <div className="absolute text-center space-y-0.5">
              <span className="text-2xl font-serif font-bold text-[#2C1D11]">{dailyPagesRead}</span>
              <span className="text-xxs tracking-wider uppercase text-[#5A7065] block">of {targetPages} pg</span>
              <span className="text-xs font-semibold text-[#5A7065]">{progressPercent}%</span>
            </div>
          </div>

          <div className="text-xs text-center text-[#5A7065]">
            {progressPercent >= 100 ? (
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium inline-block border border-emerald-200">
                ⭐ Goal Attained! Daily Sanctuary Flame lit!
              </span>
            ) : (
              <span className="font-light italic">Read {targetPages - dailyPagesRead} more pages to fulfill your daily pact.</span>
            )}
          </div>
        </div>

        {/* Quick Pages Logger */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-[#E8EDE9] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-semibold text-[#2C1D11]">Log Pages Read</h3>
            <p className="text-xs text-[#5A7065] mt-1">Reflect your progress to Saga's local tracking registry.</p>
          </div>

          <form onSubmit={handleAddPages} className="space-y-4 my-4">
            <div>
              <label htmlFor="pages-input-field" className="block text-xs font-medium text-[#2C1D11] uppercase tracking-wide mb-1">
                Amount of Pages Read Today
              </label>
              <input
                id="pages-input-field"
                type="number"
                placeholder="e.g. 15"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                min="1"
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#5A7065] transition-all text-[#2C1D11] placeholder-[#5A7065]/50"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2C1D11] hover:bg-[#1E100A] text-[#FDFBF7] font-medium text-xs tracking-wider uppercase py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>Record Pages & Update App</span>
            </button>
          </form>

          <div className="flex items-center gap-3 bg-[#FDFBF7] p-3 rounded-2xl border border-[#E8EDE9]">
            <Layers className="w-5 h-5 text-[#C5A03A]" />
            <div className="text-xs">
              <span className="font-semibold block text-[#2C1D11]">Saga Reading Track</span>
              <span className="text-[#5A7065]">Currently managing {booksInProgress} active book(s)</span>
            </div>
          </div>
        </div>

        {/* Book Club Next Gathering Gathering */}
        <div className="bg-[#FDFBF7] p-7 rounded-3xl shadow-inner border-2 border-dashed border-[#E8EDE9] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-semibold text-[#2C1D11]">Next Gathering</h3>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="my-4 bg-white p-5 rounded-2xl border border-[#E8EDE9] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#E8EDE9] text-[#2C1D11] w-8 h-8 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#5A7065]" />
              </div>
              <div>
                <span className="text-xxs uppercase tracking-wider text-[#5A7065] font-mono block">Gathering Target</span>
                <span className="text-sm font-serif font-semibold text-[#2C1D11]">Discuss {SCHED_MEETING.bookTitle}</span>
              </div>
            </div>

            <p className="text-xs text-[#5A7065] italic leading-relaxed border-l-2 border-[#C5A03A]/40 pl-3">
              “{SCHED_MEETING.topic}”
            </p>

            <div className="grid grid-cols-2 gap-2 text-xxs font-mono text-[#5A7065] pt-1">
              <div>📅 {SCHED_MEETING.date}</div>
              <div>🕒 {SCHED_MEETING.time}</div>
            </div>
          </div>

          <div className="text-xs py-2 px-3 bg-[#E8EDE9]/40 rounded-xl flex items-center justify-between text-[#5A7065]">
            <span>Platform: <strong className="text-[#2C1D11]">{SCHED_MEETING.platform}</strong></span>
          </div>
        </div>
      </div>

      {/* Elegant Digital Reading Badges Display */}
      <div className="bg-white p-8 rounded-3xl border border-[#E8EDE9] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#F5EFEB] rounded-xl text-[#C5A03A]">
            <Award className="w-5 h-5 text-[#C5A03A]" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-[#2C1D11] font-semibold">Unlocked Digital Badges</h3>
            <p className="text-xs text-[#5A7065]">Your structural milestones validated inside Saga's book sanctuary.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl flex items-center gap-4 border transition-all ${
                badge.unlocked
                  ? "bg-[#FDFBF7] border-[#C5A03A]/30 shadow-xs relative"
                  : "bg-white border-[#E8EDE9] opacity-55 grayscale"
              }`}
            >
              <div className="text-3xl filter drop-shadow-xs">{badge.unlocked ? badge.icon : "🔒"}</div>
              <div className="space-y-1">
                <span className="text-sm font-serif font-bold text-[#2C1D11] block leading-tight">
                  {badge.title}
                </span>
                <span className="text-xxs text-[#5A7065] block leading-relaxed">
                  {badge.description}
                </span>
                {badge.unlocked && badge.unlockedAt && (
                   <span className="text-xxxxs tracking-wider uppercase font-mono text-[#C5A03A] font-semibold block">
                    Unlocked: {badge.unlockedAt}
                  </span>
                )}
              </div>
              {badge.unlocked && (
                <span className="absolute top-2 right-2 bg-[#C5A03A]/20 text-[#A37B30] text-xxxxs p-1 rounded-full font-bold">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
