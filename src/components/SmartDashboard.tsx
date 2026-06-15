/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Book } from "../types";
import { MOTIVATIONAL_QUOTES, SCHED_MEETING } from "../data";
import { 
  Flame, 
  Sparkles, 
  Calendar, 
  Plus, 
  Check, 
  BookOpen, 
  Layers, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark
} from "lucide-react";

interface SmartDashboardProps {
  readingStreak: number;
  dailyStreakGoal: number;
  dailyPagesRead: number;
  setDailyPagesRead: (pages: number | ((prev: number) => number)) => void;
  incrementStreak: () => void;
  books: Book[];
  onUpdateBookProgress?: (id: string, currentPage: number) => void;
}

export const SmartDashboard: React.FC<SmartDashboardProps> = ({
  readingStreak,
  dailyPagesRead,
  setDailyPagesRead,
  incrementStreak,
  books,
  onUpdateBookProgress,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const activeBooks = books.filter((b) => b.status === "In Progress");
  const [selectedBookId, setSelectedBookId] = useState<string>("");

  // Initialize selected book
  useEffect(() => {
    if (activeBooks.length > 0 && !selectedBookId) {
      setSelectedBookId(activeBooks[0].id);
    }
  }, [books, activeBooks, selectedBookId]);

  const targetPages = 30; // standard daily reading goal

  const prevQuote = () => {
    setQuoteIndex((prev) => (prev - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length);
  };

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  // Calculate stats
  const booksInProgress = activeBooks.length;
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

      // Update actual book page progress
      if (selectedBookId && onUpdateBookProgress) {
        const targetBook = books.find((b) => b.id === selectedBookId);
        if (targetBook) {
          const nextPages = Math.min(targetBook.totalPages, targetBook.currentPage + parsed);
          onUpdateBookProgress(selectedBookId, nextPages);
        }
      }
      setPageInput("");
    }
  };

  return (
    <div id="saga-smart-dashboard" className="space-y-8 animate-fade-in font-sans">
      
      {/* Editorial Welcome Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Banner with Title, Image and Quote Carousel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1B0203] via-[#45050A] to-[#1B0203] text-[#FFFDFD] p-8 rounded-3xl shadow-xl flex flex-col justify-between border border-[#F40009]/30 relative overflow-hidden">
          {/* Subtle background reader illustration overlaid on the right for elegant visual */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 lg:opacity-40 pointer-events-none mix-blend-screen">
            <img 
              src="/src/assets/images/cozy_reader_visual_1781526400356.jpg" 
              alt="Midusa Reads sanctuary artwork" 
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-500 hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-5 relative z-10 max-w-[85%] lg:max-w-[70%]">
            <div className="inline-flex items-center gap-2 bg-[#F40009]/15 text-[#FFEBEB] px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#F40009]/35">
              <Sparkles className="w-3.5 h-3.5 text-[#F40009]" />
              <span className="uppercase tracking-wider font-mono text-[10px]">Midusa Reads Stats</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#FFFDF9] font-serif uppercase">
                Midusa Reads
              </h1>
              <p className="text-xs text-[#FFEBEB]/80 font-mono uppercase tracking-wider">
                Your Reading Achievements and Metrics
              </p>
            </div>
            
            {/* Daily Quotes Carousel Box */}
            <div className="bg-[#1B0203]/50 p-5 rounded-2xl border border-[#F40009]/20 backdrop-blur-md min-h-[120px] flex flex-col justify-between transition-all duration-300">
              <p className="text-sm md:text-base font-light leading-relaxed italic text-[#FFFDF9]">
                “{currentQuote.text}”
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xxs tracking-wider uppercase text-[#FFEBEB]/70 font-mono font-bold">
                  — {currentQuote.author}
                </span>

                {/* Carousel Navigation Toolbar */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={prevQuote}
                    type="button"
                    className="p-1 rounded-lg bg-[#FFEBEB]/10 hover:bg-[#F40009]/40 text-[#FFFDF9] transition-all cursor-pointer"
                    title="Previous Quote"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    {MOTIVATIONAL_QUOTES.map((_, idx) => (
                      <span 
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === quoteIndex ? "bg-[#F40009]" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={nextQuote}
                    type="button"
                    className="p-1 rounded-lg bg-[#FFEBEB]/10 hover:bg-[#F40009]/40 text-[#FFFDF9] transition-all cursor-pointer"
                    title="Next Quote"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center relative z-10 border-t border-[#FFFDF9]/10 pt-4">
            <span className="text-[10px] text-[#FFEBEB]/50 font-mono uppercase">MidR... Dashboard</span>
            <span className="text-[10px] text-[#FFEBEB]/70 hover:text-[#F40009] font-medium flex items-center gap-1.5 cursor-default">
              <Bookmark className="w-3.5 h-3.5 text-[#F40009]" />
              <span className="uppercase tracking-wider text-[9px]">Fonts render with your local active device</span>
            </span>
          </div>
        </div>

        {/* Dynamic Reading Streak Gauge Card */}
        <div className="bg-white p-8 rounded-3xl shadow-md border border-[#FFEBEB] flex flex-col justify-between justify-items-stretch relative">
          <div className="absolute right-4 top-4 text-[#F40009]">
            <Flame className="w-6 h-6 fill-current animate-pulse text-[#F40009]" />
          </div>

          <div className="space-y-2">
            <span className="text-xxs text-[#F40009] font-mono font-bold block uppercase tracking-wider">Reading Diligence</span>
            <h2 className="text-xl font-bold text-[#1B0203] uppercase tracking-wide">Active Reading Streak</h2>
            <p className="text-xs text-gray-500">Save your streak by reading at least {targetPages} pages daily.</p>
          </div>

          <div className="my-6 flex items-center justify-center gap-4">
            <div className="text-center">
              <span className="text-5xl font-black text-[#1B0203] block tracking-tighter">
                {readingStreak}
              </span>
              <span className="text-[10px] text-gray-500 font-bold block mt-1 uppercase">Days Active</span>
            </div>
            <div className="h-10 w-px bg-[#FFEBEB]"></div>
            <div className="text-sm text-[#1B0203] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Check className="w-3.5 h-3.5 text-[#F40009] shrink-0" />
                <span>Goal: {targetPages} pages / day</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Check className="w-3.5 h-3.5 text-[#F40009] shrink-0" />
                <span>Status: {progressPercent >= 100 ? "Goal Met!" : "Incomplete"}</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#FFFDFD] p-2 rounded-2xl border border-[#FFEBEB] flex justify-between items-center text-xs">
            <span className="text-gray-500 font-mono">Streak Flame Strength:</span>
            <span className="text-[#F40009] font-bold tracking-wider font-mono">
              {readingStreak > 0 ? "🔥 ".repeat(Math.min(3, Math.ceil(readingStreak / 3))) + "Pristine" : "❄️ Dormant"}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded active reads visual showcase */}
      {activeBooks.length > 0 && (
        <div className="bg-white p-7 rounded-3xl border border-[#FFEBEB] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#FFEBEB] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F40009]"></div>
              <h3 className="text-lg font-bold text-[#1B0203]">My Active Reads</h3>
            </div>
            <span className="text-xs text-gray-500 font-mono">Currently reading {activeBooks.length} book(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeBooks.map((book) => {
              const bookPerc = Math.round((book.currentPage / book.totalPages) * 100);
              return (
                <div key={book.id} className="p-4 bg-[#FFFDFD] border border-[#FFEBEB] rounded-2xl flex items-stretch gap-4 hover:border-[#F40009]/40 transition-all shadow-xxs">
                  <div className="w-16 h-22 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1B0203] line-clamp-1">{book.title}</h4>
                      <p className="text-[11px] text-gray-500 italic mt-0.5">{book.author}</p>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                        <span>{book.currentPage} / {book.totalPages} pages</span>
                        <span>{bookPerc}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#F40009]" 
                          style={{ width: `${bookPerc}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress & Quick Log Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Core Daily Progress Widget */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-[#FFEBEB] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1B0203]">Today's Progress Gauge</h3>
            <span className="text-xs font-bold text-[#F40009] font-mono">Goal: {targetPages}p</span>
          </div>

          <div className="my-6 relative flex justify-center items-center">
            {/* Elegant SVG Progress Indicator */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-gray-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-[#F40009]"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * progressPercent) / 100}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>
            <div className="absolute text-center space-y-0.5">
              <span className="text-2xl font-black text-[#1B0203]">{dailyPagesRead}</span>
              <span className="text-[10px] tracking-wider uppercase text-gray-500 block">of {targetPages} pg</span>
              <span className="text-xs font-bold text-[#F40009]">{progressPercent}%</span>
            </div>
          </div>

          <div className="text-xs text-center">
            {progressPercent >= 100 ? (
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-bold inline-block border border-emerald-200">
                ⭐ Daily Reading Pact Fulfilled!
              </span>
            ) : (
              <span className="italic text-gray-500">Read {targetPages - dailyPagesRead} more pages to fulfill your daily pact.</span>
            )}
          </div>
        </div>

        {/* Quick Pages Logger */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-[#FFEBEB] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1B0203]">Log Pages Read</h3>
            <p className="text-xs text-gray-500 mt-1">Record read pages and instantly update active book positions.</p>
          </div>

          <form onSubmit={handleAddPages} className="space-y-4 my-3">
            {/* Conditional Dropdown for selecting which active read was read */}
            {activeBooks.length > 0 && (
              <div>
                <label htmlFor="log-book-select" className="block text-[10px] font-bold text-[#1B0203] tracking-wide mb-1 uppercase">
                  Which book did you read?
                </label>
                <select
                  id="log-book-select"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full bg-[#FFFDFD] border border-[#FFEBEB] rounded-2xl px-4 py-2.5 text-xs text-[#1B0203] focus:outline-none focus:border-[#F40009] transition-all"
                >
                  {activeBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Page {b.currentPage}/{b.totalPages})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="pages-input-field" className="block text-[10px] font-bold text-[#1B0203] tracking-wide mb-1 uppercase">
                Amount of pages read
              </label>
              <input
                id="pages-input-field"
                type="number"
                placeholder="Enter page count (e.g. 15)"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                min="1"
                className="w-full bg-[#FFFDFD] border border-[#FFEBEB] rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F40009] transition-all text-[#1B0203] placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F40009] hover:bg-[#C30015] text-white font-bold text-xs py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>SAVE PROGRESS</span>
            </button>
          </form>

          <div className="flex items-center gap-3 bg-[#FFFDFD] p-3 rounded-2xl border border-[#FFEBEB]">
            <Layers className="w-5 h-5 text-[#F40009]" />
            <div className="text-xs">
              <span className="font-bold block text-[#1B0203] uppercase">Tracked Active Books</span>
              <span className="text-gray-500">Managing {booksInProgress} active book(s)</span>
            </div>
          </div>
        </div>

        {/* Book Club Next Gathering Gathering */}
        <div className="bg-[#FFFDFD] p-7 rounded-3xl shadow-inner border-2 border-dashed border-[#FFEBEB] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1B0203]">Next Gathering</h3>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#F40009] animate-pulse"></span>
          </div>

          <div className="my-4 bg-white p-5 rounded-2xl border border-[#FFEBEB] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#FFEBEB] text-[#F40009] w-8 h-8 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">Target Reading</span>
                <span className="text-xs font-bold text-[#1B0203] line-clamp-1">Discuss {SCHED_MEETING.bookTitle}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 italic leading-relaxed border-l-2 border-[#F40009] pl-3">
              “{SCHED_MEETING.topic}”
            </p>

            <div className="grid grid-cols-2 gap-2 text-xxs font-mono text-gray-500 pt-1">
              <div>📅 {SCHED_MEETING.date}</div>
              <div>🕒 {SCHED_MEETING.time}</div>
            </div>
          </div>

          <div className="text-xs py-2 px-3 bg-[#FFEBEB]/40 rounded-xl flex items-center justify-between text-gray-600">
            <span>Platform: <strong className="text-[#1B0203]">{SCHED_MEETING.platform}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

