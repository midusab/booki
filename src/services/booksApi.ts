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
  getDocs
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Book } from "../types";

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
  console.error("Firestore Book Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Subscribes to real-time bookshelf updates for a specific user
 */
export function subscribeToBooks(
  userId: string,
  onUpdate: (books: Book[]) => void,
  onError: (error: any) => void
) {
  const booksPath = `users/${userId}/books`;
  const q = query(collection(db, "users", userId, "books"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const booksList: Book[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        booksList.push({
          id: doc.id,
          title: data.title || "",
          author: data.author || "",
          genre: data.genre || "",
          coverImage: data.coverImage || "",
          status: data.status || "Want to Read",
          currentPage: typeof data.currentPage === "number" ? data.currentPage : 0,
          totalPages: typeof data.totalPages === "number" ? data.totalPages : 100,
          genreCategory: data.genreCategory || undefined,
          dateAdded: data.dateAdded || new Date().toISOString().split("T")[0],
        });
      });
      onUpdate(booksList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, booksPath);
    }
  );
}

/**
 * Seed initial books if the database collection is empty
 */
export async function seedInitialBooksIfEmpty(userId: string, initialBooks: Book[]): Promise<void> {
  const booksPath = `users/${userId}/books`;
  try {
    const q = query(collection(db, "users", userId, "books"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      for (const book of initialBooks) {
        const bookDocRef = doc(db, "users", userId, "books", book.id);
        await setDoc(bookDocRef, {
          id: book.id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          coverImage: book.coverImage,
          status: book.status,
          currentPage: book.currentPage,
          totalPages: book.totalPages,
          genreCategory: book.genreCategory || null,
          dateAdded: book.dateAdded,
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, booksPath);
  }
}

/**
 * Adds a new book to the user's private bookshelf
 */
export async function addBook(userId: string, book: Book): Promise<void> {
  const booksPath = `users/${userId}/books/${book.id}`;
  try {
    const bookDocRef = doc(db, "users", userId, "books", book.id);
    await setDoc(bookDocRef, {
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      coverImage: book.coverImage,
      status: book.status,
      currentPage: book.currentPage,
      totalPages: book.totalPages,
      genreCategory: book.genreCategory || null,
      dateAdded: book.dateAdded,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, booksPath);
  }
}

/**
 * Updates an existing book's progress
 */
export async function updateBook(
  userId: string,
  bookId: string,
  updates: Partial<Omit<Book, "id">>
): Promise<void> {
  const booksPath = `users/${userId}/books/${bookId}`;
  try {
    const bookDocRef = doc(db, "users", userId, "books", bookId);
    
    const sanitizedUpdates: any = {};
    Object.entries(updates).forEach(([key, val]) => {
      sanitizedUpdates[key] = val === undefined ? null : val;
    });

    await setDoc(bookDocRef, sanitizedUpdates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, booksPath);
  }
}

/**
 * Deletes a book from the user's bookshelf
 */
export async function removeBook(userId: string, bookId: string): Promise<void> {
  const booksPath = `users/${userId}/books/${bookId}`;
  try {
    const bookDocRef = doc(db, "users", userId, "books", bookId);
    await deleteDoc(bookDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, booksPath);
  }
}
