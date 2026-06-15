/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, Review, ReadingBadge } from "./types";

export const INITIAL_BOOKS: Book[] = [
  {
    id: "book-1",
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Contemporary Fiction",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    status: "In Progress",
    currentPage: 184,
    totalPages: 304,
    genreCategory: "Fiction",
    dateAdded: "2026-06-01",
  },
  {
    id: "book-2",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    status: "In Progress",
    currentPage: 412,
    totalPages: 608,
    genreCategory: "Sci-Fi",
    dateAdded: "2026-05-15",
  },
  {
    id: "book-3",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genre: "Literary Sci-Fi",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    status: "Completed",
    currentPage: 320,
    totalPages: 320,
    genreCategory: "Fiction",
    dateAdded: "2026-05-01",
  },
  {
    id: "book-4",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Psychological Thriller",
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
    status: "Want to Read",
    currentPage: 0,
    totalPages: 336,
    genreCategory: "Mystery",
    dateAdded: "2026-06-10",
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    bookTitle: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    reviewerName: "Genevieve Vance",
    reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    rating: 5,
    text: "Ishiguro's prose is deceptively simple, but the emotional payload is devastating. Klara's narrative voice captures a poignant blend of innocence and acute observation. The philosophical exploration of what it means to love and to be human left me in tears. A perfect fit for our monthly discussion.",
    vibe: "Poetic",
    upvotes: 14,
    upvotedByMe: false,
    timestamp: "2026-06-12T14:30:00Z",
    comments: [
      {
        id: "c-1",
        authorName: "Marcus Sterling",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        text: "I completely agree! The ending was heartbreakingly beautiful. Can't wait to discuss the religious metaphors on Tuesday.",
        timestamp: "2026-06-12T16:15:00Z"
      }
    ]
  },
  {
    id: "rev-2",
    bookTitle: "Dune",
    author: "Frank Herbert",
    reviewerName: "Julian Kross",
    reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    rating: 4,
    text: "An absolute masterclass in world-building. Re-reading this with Midusa Reads has made me appreciate the intricate layers of ecology, politics, and mysticism even more. It is heavy, dense, and demanding, but incredibly rewarding. The golden-espresso dust smells feel very real here.",
    vibe: "Mind-Bending",
    upvotes: 9,
    upvotedByMe: false,
    timestamp: "2026-06-10T09:12:00Z",
    comments: []
  },
  {
    id: "rev-3",
    bookTitle: "The Midnight Library",
    author: "Matt Haig",
    reviewerName: "Amelia Chen",
    reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    rating: 5,
    text: "Such a wholesome and deeply comforting read. For anyone who struggles with regret or 'what ifs', this book is an absolute warm hug in a mug. It makes me cherish the little library sessions of our club. A beautiful exploration of ordinary magic.",
    vibe: "Cozy",
    upvotes: 18,
    upvotedByMe: true,
    timestamp: "2026-06-14T18:45:00Z",
    comments: [
      {
        id: "c-2",
        authorName: "Genevieve Vance",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        text: "Amelia, your review makes me want to start a re-read tonight! Let's pair it with chamomile tea.",
        timestamp: "2026-06-15T02:10:00Z"
      }
    ]
  }
];

export const INITIAL_BADGES: ReadingBadge[] = [
  {
    id: "badge-1",
    title: "Sanctuary Devotee",
    description: "Achieve a 5-day reading streak",
    icon: "🎯",
    unlocked: true,
    unlockedAt: "2026-06-14",
    goalType: "streak",
    goalValue: 5,
  },
  {
    id: "badge-2",
    title: "Page Turner",
    description: "Read more than 50 pages in a single today",
    icon: "📖",
    unlocked: false,
    goalType: "pages",
    goalValue: 50,
  },
  {
    id: "badge-3",
    title: "Literary Scholar",
    description: "Complete 3 books on your bookshelf",
    icon: "🎓",
    unlocked: false,
    goalType: "books_completed",
    goalValue: 3,
  },
  {
    id: "badge-4",
    title: "Vibe Curator",
    description: "Post a review in the Discussion Lounge",
    icon: "✍️",
    unlocked: true,
    unlockedAt: "2026-06-14",
    goalType: "social_reviews",
    goalValue: 1,
  }
];

export const MOTIVATIONAL_QUOTES = [
  {
    text: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
  },
  {
    text: "Reading is a conversation. All books talk. But a good book listens as well.",
    author: "Mark Haddon",
  },
  {
    text: "I have always imagined that Paradise will be a kind of library.",
    author: "Jorge Luis Borges",
  },
  {
    text: "Until I feared I would lose it, I never loved to read. One does not love breathing.",
    author: "Harper Lee",
  },
  {
    text: "The reading of all good books is like a conversation with the finest minds of past centuries.",
    author: "René Descartes",
  },
];

export const SCHED_MEETING = {
  id: "meeting-1",
  bookTitle: "Dune",
  date: "2026-06-20",
  time: "19:30 PST",
  platform: "Midusa Reads Lounge ☕",
  topic: "Chapters 12-25: Melange, Mysticism & Political Manipulation",
};

export const AMBIENT_TRACKS = [
  {
    id: "rain",
    title: "Cozy Autumn Rain",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    description: "Soft rainfall pitter-pattering on wide conservatory glass",
    icon: "🌧️"
  },
  {
    id: "fireplace",
    title: "Hearthside Crackle",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    description: "Warm glowing embers in a thick oak-lined estate fireplace",
    icon: "🔥"
  },
  {
    id: "cafe",
    title: "Chopin Cafe Jazz",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    description: "Subtle clinking porcelain under a soft lounge cello & piano",
    icon: "☕"
  }
];
