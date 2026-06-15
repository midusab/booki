/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Review, ReviewVibe } from "../types";
import { 
  Heart, 
  MessageSquare, 
  Search, 
  Tag, 
  Star, 
  Plus, 
  X, 
  ArrowUpRight 
} from "lucide-react";

interface DiscussionLoungeProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, "id" | "reviewerAvatar" | "upvotes" | "comments" | "timestamp">) => void;
  onUpvoteReview: (id: string) => void;
  onAddComment: (reviewId: string, commentText: string) => void;
}

const ALL_VIBES: (ReviewVibe | "All")[] = ["All", "Mind-Bending", "Cozy", "Poetic", "Heartbreaking", "Dark & Grim", "Wholesome"];

export const DiscussionLounge: React.FC<DiscussionLoungeProps> = ({
  reviews,
  onAddReview,
  onUpvoteReview,
  onAddComment,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<ReviewVibe | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Comment Thread Expansion state
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [newCommentInput, setNewCommentInput] = useState<Record<string, string>>({});

  // Add Review form
  const [showForm, setShowForm] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [vibe, setVibe] = useState<ReviewVibe>("Cozy");
  const [text, setText] = useState("");

  const toggleThread = (id: string) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCommentSubmit = (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    const commentText = newCommentInput[reviewId];
    if (!commentText || !commentText.trim()) return;

    onAddComment(reviewId, commentText.trim());
    setNewCommentInput((prev) => ({
      ...prev,
      [reviewId]: "",
    }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !author.trim() || !text.trim()) return;

    onAddReview({
      bookTitle: bookTitle.trim(),
      author: author.trim(),
      reviewerName: reviewerName.trim() || "Saga Sage",
      rating,
      vibe,
      text: text.trim(),
    });

    // Reset fields
    setBookTitle("");
    setAuthor("");
    setReviewerName("");
    setRating(5);
    setVibe("Cozy");
    setText("");
    setShowForm(false);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    const matchesVibe = selectedVibe === "All" || rev.vibe === selectedVibe;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      rev.bookTitle.toLowerCase().includes(searchLower) ||
      rev.author.toLowerCase().includes(searchLower) ||
      rev.text.toLowerCase().includes(searchLower) ||
      rev.reviewerName.toLowerCase().includes(searchLower);

    return matchesVibe && matchesSearch;
  });

  return (
    <div id="saga-discussion-lounge" className="space-y-6 animate-fade-in">
      
      {/* Search & Vibe Filters Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8EDE9] shadow-xxs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#5A7065]" />
            <input
              type="text"
              placeholder="Search reviews, authors, or literary notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065] transition-colors"
            />
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            type="button"
            className="px-5 py-3 bg-[#2C1D11] hover:bg-[#1E100A] text-[#FDFBF7] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Share a Vibe</span>
          </button>
        </div>

        {/* Filter Scroll panel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xxs tracking-wider uppercase font-semibold font-mono text-[#5A7065] mr-2 shrink-0">Vibe Filters:</span>
          {ALL_VIBES.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVibe(v)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xxs transition-all cursor-pointer shrink-0 ${
                selectedVibe === v
                  ? "bg-[#5A7065] text-[#FDFBF7] font-semibold"
                  : "bg-[#FDFBF7] text-[#5A7065] hover:bg-[#F5EFEB] border border-[#E8EDE9]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Write a Vibe Modal Sidebar/Form */}
      {showForm && (
        <form onSubmit={handleReviewSubmit} className="bg-white p-7 rounded-3xl border border-[#E8EDE9] shadow-md space-y-4 animate-slide-up">
          <div className="flex justify-between items-center border-b border-[#E8EDE9] pb-3">
            <h3 className="text-lg font-serif font-bold text-[#2C1D11]">Compose Review Spark</h3>
            <button
              onClick={() => setShowForm(false)}
              type="button"
              className="text-[#5A7065] hover:text-[#2C1D11] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="rev-title-field" className="block text-xxs uppercase tracking-wider font-semibold text-[#5A7065]">Book Title</label>
              <input
                id="rev-title-field"
                type="text"
                placeholder="e.g. The Midnight Library"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="rev-author-field" className="block text-xxs uppercase tracking-wider font-semibold text-[#5A7065]">Author</label>
              <input
                id="rev-author-field"
                type="text"
                placeholder="e.g. Matt Haig"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="rev-username" className="block text-xxs uppercase tracking-wider font-semibold text-[#5A7065]">Your Name (Reviewer)</label>
              <input
                id="rev-username"
                type="text"
                placeholder="e.g. Amelia Chen"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="rev-rating" className="block text-xxs uppercase tracking-wider font-semibold text-[#5A7065]">Stars Rating</label>
                <select
                  id="rev-rating"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value, 10))}
                  className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value="3">⭐⭐⭐ (3 Stars)</option>
                  <option value="2">⭐⭐ (2 Stars)</option>
                  <option value="1">⭐ (1 Star)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="rev-vibe" className="block text-xxs uppercase tracking-wider font-semibold text-[#5A7065]">Review Vibe</label>
                <select
                  id="rev-vibe"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value as any)}
                  className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
                >
                  <option value="Cozy">Cozy (Warm tea & slow pace)</option>
                  <option value="Mind-Bending">Mind-Bending (Complex twist)</option>
                  <option value="Poetic">Poetic (Dreamy & melodic)</option>
                  <option value="Heartbreaking">Heartbreaking (Highly emotional)</option>
                  <option value="Dark & Grim">Dark & Grim (Edgy & tension)</option>
                  <option value="Wholesome">Wholesome (Light joy & heart)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label htmlFor="rev-text" className="block text-xxs uppercase tracking-wider font-semibold text-[#5A7065]">Your Literary Review Text</label>
              <textarea
                id="rev-text"
                rows={4}
                placeholder="Inscribe your reflection here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl p-3.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowForm(false)}
              type="button"
              className="px-4 py-2 border border-[#E8EDE9] hover:bg-[#FDFBF7] text-xs text-[#5A7065] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2C1D11] hover:bg-[#1E100A] text-[#FDFBF7] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Post to Lounge Feed
            </button>
          </div>
        </form>
      )}

      {/* Discussion Lounge Social Feed List */}
      <div className="space-y-5">
        {filteredReviews.length === 0 ? (
          <div className="bg-white py-16 text-center border border-[#E8EDE9] rounded-3xl text-sm italic text-[#5A7065] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#A3B5A9] mx-auto animate-pulse" />
            <p>No matching review reflections found. Clear filters or initiate a conversation!</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const vibeColorMap: Record<string, string> = {
              "Mind-Bending": "bg-purple-50 text-purple-700 border-purple-100",
              "Cozy": "bg-amber-50 text-amber-700 border-amber-100",
              "Poetic": "bg-emerald-50 text-emerald-700 border-emerald-100",
              "Heartbreaking": "bg-red-50 text-red-700 border-red-100",
              "Dark & Grim": "bg-neutral-800 text-neutral-100 border-neutral-700",
              "Wholesome": "bg-sky-50 text-sky-700 border-sky-100"
            };

            const isThreadOpen = expandedThreads[rev.id];

            return (
              <div 
                key={rev.id} 
                className="bg-white p-6 rounded-3xl border border-[#E8EDE9] shadow-xxs space-y-4 hover:border-[#D5DDD7] transition-all"
              >
                {/* Header User details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.reviewerAvatar}
                      alt={rev.reviewerName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-[#E8EDE9] object-cover"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#2C1D11] block">{rev.reviewerName}</span>
                      <span className="text-xxxxs text-[#5A7065] font-mono block">
                        SHARED IN THE LOUNGE • {new Date(rev.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-xxxxs tracking-wider uppercase font-semibold font-mono rounded-lg border ${vibeColorMap[rev.vibe] || "bg-[#F5EFEB]"}`}>
                    {rev.vibe}
                  </span>
                </div>

                {/* Book Header info */}
                <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#E8EDE9] flex justify-between items-center group">
                  <div>
                    <span className="text-xxs tracking-wider font-mono text-[#5A7065] uppercase block">CRITIQUE FOCUS</span>
                    <span className="text-sm font-serif font-bold text-[#2C1D11] group-hover:text-[#5A7065] transition-colors">{rev.bookTitle}</span>
                    <span className="text-xxs text-[#5A7065] block font-light italic">by {rev.author}</span>
                  </div>

                  <div className="flex text-[#C5A03A]">
                    {Array.from({ length: rev.rating }).map((_, rI) => (
                      <Star key={rI} className="w-3.5 h-3.5 fill-current text-[#C5A03A]" />
                    ))}
                  </div>
                </div>

                {/* Main Text Content */}
                <p className="text-xs text-[#2C1D11] leading-relaxed font-light font-sans py-1">
                  “ {rev.text} ”
                </p>

                {/* Interactive Action buttons */}
                <div className="flex items-center gap-4 border-t border-[#E8EDE9] pt-3.5 text-[#5A7065] text-xxs">
                  <button
                    onClick={() => onUpvoteReview(rev.id)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer hover:bg-[#FDFBF7] transition-all ${
                      rev.upvotedByMe 
                        ? "bg-[#5A7065] text-[#FDFBF7] border-[#5A7065]" 
                        : "bg-white border-[#E8EDE9]"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${rev.upvotedByMe ? "fill-current" : ""}`} />
                    <span className="font-semibold">{rev.upvotes} Spark Upvotes</span>
                  </button>

                  <button
                    onClick={() => toggleThread(rev.id)}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFBF7] hover:bg-[#F5EFEB] text-[#2C1D11] border border-[#E8EDE9] rounded-lg cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#5A7065]" />
                    <span>{rev.comments.length} Comments</span>
                  </button>
                </div>

                {/* Nested Comment Thread */}
                {isThreadOpen && (
                  <div className="bg-[#FDFBF7]/60 p-4.5 rounded-2xl border border-[#E8EDE9] space-y-4 animate-slide-up">
                    <h4 className="text-xxs uppercase tracking-wider font-semibold font-mono text-[#5A7065]">Comments Reflection Block</h4>

                    {rev.comments.length > 0 && (
                      <div className="space-y-3.5 max-h-56 overflow-y-auto">
                        {rev.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2.5 items-start bg-white p-3 rounded-xl border border-[#E8EDE9]/80">
                            <img
                              src={comment.authorAvatar}
                              alt={comment.authorName}
                              referrerPolicy="no-referrer"
                              className="w-7.5 h-7.5 rounded-full border border-[#E8EDE9] object-cover"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-3xs font-semibold text-[#2C1D11]">{comment.authorName}</span>
                                <span className="text-[9px] text-[#5A7065] font-mono">
                                  {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-3xs text-[#2C1D11] leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Inline Comment Post form */}
                    <form onSubmit={(e) => handleCommentSubmit(e, rev.id)} className="flex gap-2 items-center pt-1.5">
                      <input
                        type="text"
                        placeholder="Inscribe a supportive reply..."
                        value={newCommentInput[rev.id] || ""}
                        onChange={(e) => setNewCommentInput((prev) => ({
                          ...prev,
                          [rev.id]: e.target.value,
                        }))}
                        className="flex-1 bg-white border border-[#E8EDE9] rounded-xl px-3 py-2 text-3xs focus:outline-none focus:border-[#5A7065] text-[#2C1D11]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-[#2C1D11] hover:bg-[#1E100A] text-[#FDFBF7] text-3xs rounded-xl font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                      >
                        Send
                      </button>
                    </form>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
