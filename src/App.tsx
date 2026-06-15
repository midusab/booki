/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Book, Review, ReadingBadge, BookStatus } from "./types";
import { INITIAL_BOOKS, INITIAL_REVIEWS, INITIAL_BADGES } from "./data";
import { SmartDashboard } from "./components/SmartDashboard";
import { AmbientReadingRoom } from "./components/AmbientReadingRoom";
import { BookshelfAnalytics } from "./components/BookshelfAnalytics";
import { DiscussionLounge } from "./components/DiscussionLounge";
import { 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Feather, 
  Layers, 
  Clock, 
  MessageSquare, 
  Menu, 
  X,
  Compass,
  LogOut
} from "lucide-react";
import { useAuth } from "./features/auth/hooks/useAuth";

export default function App() {
  const { user, logout } = useAuth();

  // Main states
  const [readingStreak, setReadingStreak] = useState<number>(5); // default pre-populate 5 based on user prompt
  const [dailyPagesRead, setDailyPagesRead] = useState<number>(22);
  const [books, setBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [badges, setBadges] = useState<ReadingBadge[]>([]);

  // Navigation state
  const [currentView, setCurrentView] = useState<"dashboard" | "bookshelf" | "timer" | "lounge">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize data from localStorage or default static templates on mount
  useEffect(() => {
    const localBooks = localStorage.getItem("saga_bookshelf");
    if (localBooks) {
      setBooks(JSON.parse(localBooks));
    } else {
      setBooks(INITIAL_BOOKS);
      localStorage.setItem("saga_bookshelf", JSON.stringify(INITIAL_BOOKS));
    }

    const localReviews = localStorage.getItem("saga_reviews");
    if (localReviews) {
      setReviews(JSON.parse(localReviews));
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem("saga_reviews", JSON.stringify(INITIAL_REVIEWS));
    }

    const localBadges = localStorage.getItem("saga_badges");
    if (localBadges) {
      setBadges(JSON.parse(localBadges));
    } else {
      setBadges(INITIAL_BADGES);
      localStorage.setItem("saga_badges", JSON.stringify(INITIAL_BADGES));
    }

    const localStreak = localStorage.getItem("saga_reading_streak");
    if (localStreak) {
      setReadingStreak(parseInt(localStreak, 10));
    } else {
      localStorage.setItem("saga_reading_streak", "5");
    }

    const localPages = localStorage.getItem("saga_daily_pages");
    if (localPages) {
      setDailyPagesRead(parseInt(localPages, 10));
    } else {
      localStorage.setItem("saga_daily_pages", "22");
    }
  }, []);

  // Save changes automatically on state transitions
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem("saga_bookshelf", JSON.stringify(books));
    }
  }, [books]);

  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem("saga_reviews", JSON.stringify(reviews));
    }
  }, [reviews]);

  useEffect(() => {
    if (badges.length > 0) {
      localStorage.setItem("saga_badges", JSON.stringify(badges));
    }
  }, [badges]);

  useEffect(() => {
    localStorage.setItem("saga_reading_streak", readingStreak.toString());
  }, [readingStreak]);

  useEffect(() => {
    localStorage.setItem("saga_daily_pages", dailyPagesRead.toString());
    
    // Check page-related badgess on daily increment
    if (dailyPagesRead >= 50) {
      handleUnlockBadge("badge-2"); // Page Turner
    }
  }, [dailyPagesRead]);

  // Streak update function
  const handleIncrementStreak = () => {
    setReadingStreak((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        handleUnlockBadge("badge-1"); // Sanctuary Devotee
      }
      return next;
    });
  };

  // Badge trigger logic helper
  const handleUnlockBadge = (id: string) => {
    setBadges((prev) =>
      prev.map((badge) => {
        if (badge.id === id && !badge.unlocked) {
          return {
            ...badge,
            unlocked: true,
            unlockedAt: new Date().toISOString().split("T")[0],
          };
        }
        return badge;
      })
    );
  };

  // Bookshelf functions
  const handleAddBook = (newBook: Omit<Book, "id" | "dateAdded">) => {
    const bookWithId: Book = {
      ...newBook,
      id: `book-${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0],
    };
    setBooks((prev) => [...prev, bookWithId]);
  };

  const handleUpdateBookProgress = (id: string, currentPage: number, status?: BookStatus) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === id) {
          const updatedStatus = status || (currentPage === book.totalPages ? "Completed" : book.status);
          
          // Badge check: if completing books
          if (updatedStatus === "Completed" && book.status !== "Completed") {
            const currentCompleted = books.filter((b) => b.status === "Completed").length + 1;
            if (currentCompleted >= 3) {
              handleUnlockBadge("badge-3"); // Literary Scholar
            }
          }

          return {
            ...book,
            currentPage,
            status: updatedStatus,
          };
        }
        return book;
      })
    );
  };

  const handleRemoveBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  // Review & Lounge functions
  const handleAddReview = (newRev: Omit<Review, "id" | "reviewerAvatar" | "upvotes" | "comments" | "timestamp">) => {
    const fullReview: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      reviewerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      upvotes: 0,
      timestamp: new Date().toISOString(),
      comments: [],
    };
    setReviews((prev) => [fullReview, ...prev]);
    handleUnlockBadge("badge-4"); // Vibe Curator
  };

  const handleUpvoteReview = (id: string) => {
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === id) {
          const isUpvoted = rev.upvotedByMe;
          return {
            ...rev,
            upvotes: isUpvoted ? rev.upvotes - 1 : rev.upvotes + 1,
            upvotedByMe: !isUpvoted,
          };
        }
        return rev;
      })
    );
  };

  const handleAddComment = (reviewId: string, commentText: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: "Club Companion",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === reviewId) {
          return {
            ...rev,
            comments: [...rev.comments, newComment],
          };
        }
        return rev;
      })
    );
  };

  return (
    <div className="min-h-screen bg-bg-cream text-accent-espresso font-sans flex flex-col justify-between">
      
      {/* Luxury Brand Header */}
      <header className="sticky top-0 z-40 bg-bg-cream/85 backdrop-blur-md border-b border-[#FFEBEB] py-4.5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl tracking-normal text-[#F40009]">📚</span>
            <div>
              <span className="font-serif text-3xl font-black tracking-wider text-[#F40009] block leading-none">
                MidR...
              </span>
              <span className="text-[9px] tracking-widest text-gray-500 font-mono block mt-1 uppercase">
                Your Personal Reading Space
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FFEBEB]/40 p-1 rounded-2xl border border-[#FFEBEB]">
            <button
              onClick={() => setCurrentView("dashboard")}
              type="button"
              className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === "dashboard"
                  ? "bg-white text-[#1B0203] shadow-xs"
                  : "text-gray-500 hover:text-[#1B0203]"
              }`}
            >
              <Compass className="w-4 h-4 text-[#F40009]" />
              <span className="uppercase tracking-wider text-[10px]">Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView("bookshelf")}
              type="button"
              className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === "bookshelf"
                  ? "bg-white text-[#1B0203] shadow-xs"
                  : "text-gray-500 hover:text-[#1B0203]"
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#F40009]" />
              <span className="uppercase tracking-wider text-[10px]">Library</span>
            </button>
            <button
              onClick={() => setCurrentView("timer")}
              type="button"
              className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === "timer"
                  ? "bg-white text-[#1B0203] shadow-xs"
                  : "text-gray-500 hover:text-[#1B0203]"
              }`}
            >
              <Clock className="w-4 h-4 text-[#F40009]" />
              <span className="uppercase tracking-wider text-[10px]">Pomodoro Timer</span>
            </button>
            <button
              onClick={() => setCurrentView("lounge")}
              type="button"
              className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === "lounge"
                  ? "bg-white text-[#1B0203] shadow-xs"
                  : "text-gray-500 hover:text-[#1B0203]"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#F40009]" />
              <span className="uppercase tracking-wider text-[10px]">Discussions</span>
            </button>
          </nav>

          {/* User Profile Pill & Logout (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5 bg-[#FFEBEB]/20 border border-[#FFEBEB] pl-2.5 pr-4 py-1.5 rounded-2xl">
                <img 
                  src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                  alt={user.displayName || "Member"}
                  className="w-7 h-7 rounded-full object-cover border border-[#F40009]/20"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-[8px] text-gray-400 font-mono font-bold block leading-none uppercase tracking-wider">Reader</span>
                  <span className="text-[#1B0203] block truncate max-w-[100px] leading-tight mt-0.5 text-xs font-bold font-serif">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </div>
              </div>
            )}
            
            <button
              onClick={logout}
              type="button"
              className="p-2.5 rounded-2xl bg-[#FFEBEB]/40 hover:bg-[#FFEBEB] text-[#F40009] border border-[#FFEBEB] hover:border-[#F40009]/20 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="lg:hidden p-2 text-[#2C1D11] hover:bg-[#F5EFEB] rounded-xl transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Options */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-3.5 border-t border-[#FFEBEB] flex flex-col gap-2 animate-slide-up">
            <button
              onClick={() => { setCurrentView("dashboard"); setIsMobileMenuOpen(false); }}
              type="button"
              className={`px-4 py-3 rounded-xl text-xs font-semibold tracking-wide text-left flex items-center gap-2 transition-colors ${
                currentView === "dashboard" ? "bg-[#F40009] text-white" : "text-gray-500 hover:bg-[#FFEBEB]/40"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="uppercase tracking-wider">Dashboard</span>
            </button>
            <button
              onClick={() => { setCurrentView("bookshelf"); setIsMobileMenuOpen(false); }}
              type="button"
              className={`px-4 py-3 rounded-xl text-xs font-semibold tracking-wide text-left flex items-center gap-2 transition-colors ${
                currentView === "bookshelf" ? "bg-[#F40009] text-white" : "text-gray-500 hover:bg-[#FFEBEB]/40"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="uppercase tracking-wider">Library</span>
            </button>
            <button
              onClick={() => { setCurrentView("timer"); setIsMobileMenuOpen(false); }}
              type="button"
              className={`px-4 py-3 rounded-xl text-xs font-semibold tracking-wide text-left flex items-center gap-2 transition-colors ${
                currentView === "timer" ? "bg-[#F40009] text-white" : "text-gray-500 hover:bg-[#FFEBEB]/40"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="uppercase tracking-wider">Pomodoro Timer</span>
            </button>
            <button
              onClick={() => { setCurrentView("lounge"); setIsMobileMenuOpen(false); }}
              type="button"
              className={`px-4 py-3 rounded-xl text-xs font-semibold tracking-wide text-left flex items-center gap-2 transition-colors ${
                currentView === "lounge" ? "bg-[#F40009] text-white" : "text-gray-500 hover:bg-[#FFEBEB]/40"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="uppercase tracking-wider">Discussions</span>
            </button>

            {/* Mobile User Profile & LogOut */}
            <div className="mt-4 pt-4 border-t border-[#FFEBEB] flex items-center justify-between">
              {user && (
                <div className="flex items-center gap-2.5">
                  <img 
                    src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                    alt={user.displayName || "Member"}
                    className="w-8 h-8 rounded-full object-cover border border-[#F40009]/20"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[8px] text-gray-400 font-mono block leading-none uppercase tracking-wider">Member</span>
                    <span className="text-xs font-bold text-[#1B0203] block mt-1 leading-none font-serif">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={logout}
                type="button"
                className="px-3.5 py-2.5 bg-[#FFEBEB]/60 hover:bg-[#FFEBEB] hover:text-[#B80006] text-[#F40009] text-xs font-mono font-bold rounded-xl border border-[#FFEBEB] cursor-pointer transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Primary Application Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* Active view layout routing */}
        {currentView === "dashboard" && (
          <SmartDashboard
            readingStreak={readingStreak}
            dailyStreakGoal={30}
            dailyPagesRead={dailyPagesRead}
            setDailyPagesRead={setDailyPagesRead}
            incrementStreak={handleIncrementStreak}
            books={books}
            onUpdateBookProgress={handleUpdateBookProgress}
          />
        )}

        {currentView === "bookshelf" && (
          <BookshelfAnalytics
            books={books}
            onAddBook={handleAddBook}
            onUpdateProgress={handleUpdateBookProgress}
            onRemoveBook={handleRemoveBook}
          />
        )}

        {currentView === "timer" && (
          <AmbientReadingRoom 
            books={books}
            onUpdateBookProgress={handleUpdateBookProgress}
          />
        )}

        {currentView === "lounge" && (
          <DiscussionLounge
            reviews={reviews}
            onAddReview={handleAddReview}
            onUpvoteReview={handleUpvoteReview}
            onAddComment={handleAddComment}
          />
        )}

      </main>

      {/* Premium Editorial Footer block */}
      <footer className="bg-[#1E100A] text-[#FDFBF7]/60 py-8 px-6 md:px-12 border-t border-[#C5A03A]/10 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
          <div className="text-left space-y-1">
            <span className="text-[#FFFDF9] font-serif font-black tracking-widest text-sm block">SAGA</span>
            <span className="text-xxxxs tracking-wider uppercase">Sovereign space for digital readers.</span>
          </div>

          <div className="flex gap-4">
            <span className="hover:text-[#C5A03A] transition-colors cursor-help">Library Rules</span>
            <span>•</span>
            <span className="hover:text-[#C5A03A] transition-colors cursor-help">Themed Sparks</span>
            <span>•</span>
            <span className="hover:text-[#C5A03A] transition-colors cursor-help">Local Cache Status: Secured</span>
          </div>

          <div className="text-xxxxs tracking-wider font-mono text-right">
            CURATED IN COLD PRESS SILICON • 2026
          </div>
        </div>
      </footer>

    </div>
  );
}
