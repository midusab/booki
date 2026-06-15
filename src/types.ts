/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BookStatus = "Want to Read" | "In Progress" | "Completed";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
  status: BookStatus;
  currentPage: number;
  totalPages: number;
  genreCategory?: string; // e.g., "Fiction", "Sci-Fi", "Memoir", "Mystery", "Poetry"
  dateAdded: string;
}

export type ReviewVibe = "Mind-Bending" | "Cozy" | "Poetic" | "Heartbreaking" | "Dark & Grim" | "Wholesome";

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  bookTitle: string;
  author: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  text: string;
  vibe: ReviewVibe;
  upvotes: number;
  upvotedByMe?: boolean;
  comments: Comment[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "saga";
  text: string;
  timestamp: string;
  isTyping?: boolean;
  suggestedPrompts?: string[];
}

export interface ReadingBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  goalType: "streak" | "pages" | "books_completed" | "social_reviews";
  goalValue: number;
}
