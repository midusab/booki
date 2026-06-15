/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Review, Comment } from "../types";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error("Firestore Discussion Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Subscribes to real-time reviews in global discussions
 */
export function subscribeToReviews(
  currentUserId: string | null | undefined,
  onUpdate: (reviews: Review[]) => void,
  onError: (error: any) => void
) {
  const reviewsPath = "reviews";
  const q = query(collection(db, "reviews"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const reviewsList: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const upvotedByList = Array.isArray(data.upvotedBy) ? data.upvotedBy : [];
        const isUpvotedByMe = currentUserId ? upvotedByList.includes(currentUserId) : false;
        
        reviewsList.push({
          id: doc.id,
          bookTitle: data.bookTitle || "",
          author: data.author || "",
          reviewerName: data.reviewerName || "Midusa Sage",
          reviewerAvatar: data.reviewerAvatar || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=150",
          rating: typeof data.rating === "number" ? data.rating : 5,
          text: data.text || "",
          vibe: data.vibe || "Cozy",
          upvotes: typeof data.upvotes === "number" ? data.upvotes : upvotedByList.length,
          upvotedByMe: isUpvotedByMe,
          comments: Array.isArray(data.comments) ? data.comments : [],
          timestamp: data.timestamp || new Date().toISOString(),
        } as Review);
      });
      
      // Sort reviews by timestamp descending
      reviewsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      onUpdate(reviewsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, reviewsPath);
    }
  );
}

/**
 * Seed initial reviews if empty
 */
export async function seedInitialReviewsIfEmpty(initialReviews: Review[]): Promise<void> {
  const reviewsPath = "reviews";
  try {
    const q = query(collection(db, "reviews"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      for (const rev of initialReviews) {
        const revDocRef = doc(db, "reviews", rev.id);
        await setDoc(revDocRef, {
          id: rev.id,
          bookTitle: rev.bookTitle,
          author: rev.author,
          reviewerName: rev.reviewerName,
          reviewerAvatar: rev.reviewerAvatar,
          rating: rev.rating,
          text: rev.text,
          vibe: rev.vibe,
          upvotes: rev.upvotes || 0,
          upvotedBy: [],
          comments: rev.comments || [],
          timestamp: rev.timestamp,
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, reviewsPath);
  }
}

/**
 * Adds a new review globally
 */
export async function addReview(review: Review): Promise<void> {
  const reviewPath = `reviews/${review.id}`;
  try {
    const reviewDocRef = doc(db, "reviews", review.id);
    await setDoc(reviewDocRef, {
      id: review.id,
      bookTitle: review.bookTitle,
      author: review.author,
      reviewerName: review.reviewerName,
      reviewerAvatar: review.reviewerAvatar,
      reviewerUid: auth.currentUser?.uid || "anonymous",
      rating: review.rating,
      text: review.text,
      vibe: review.vibe,
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      timestamp: review.timestamp,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, reviewPath);
  }
}

/**
 * Toggle upvote for a review in real-time using atomic array modification
 */
export async function toggleUpvoteReview(reviewId: string, userId: string): Promise<void> {
  const reviewPath = `reviews/${reviewId}`;
  try {
    const reviewDocRef = doc(db, "reviews", reviewId);
    const snap = await getDoc(reviewDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const upvotedByList = Array.isArray(data.upvotedBy) ? data.upvotedBy : [];
      const hasUpvoted = upvotedByList.includes(userId);
      if (hasUpvoted) {
        await updateDoc(reviewDocRef, {
          upvotedBy: arrayRemove(userId),
          upvotes: increment(-1)
        });
      } else {
        await updateDoc(reviewDocRef, {
          upvotedBy: arrayUnion(userId),
          upvotes: increment(1)
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, reviewPath);
  }
}

/**
 * Adds a comment to a review in real-time
 */
export async function addCommentToReview(reviewId: string, comment: Comment): Promise<void> {
  const reviewPath = `reviews/${reviewId}`;
  try {
    const reviewDocRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewDocRef, {
      comments: arrayUnion(comment)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, reviewPath);
  }
}

/**
 * Save review document directly (for upvotes / comments update fallback)
 */
export async function saveReviewDocument(reviewId: string, updatedFields: Partial<Review>): Promise<void> {
  const reviewPath = `reviews/${reviewId}`;
  try {
    const reviewDocRef = doc(db, "reviews", reviewId);
    await setDoc(reviewDocRef, updatedFields, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, reviewPath);
  }
}
