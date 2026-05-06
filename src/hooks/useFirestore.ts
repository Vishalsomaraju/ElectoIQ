// src/hooks/useFirestore.ts
import { useState, useCallback } from 'react'
import { logger } from '../utils/logger'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  WhereFilterOp,
  QueryConstraint,
} from 'firebase/firestore'
import { auth, db } from '../services/firebase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseFirestoreResult {
  loading: boolean
  error: string | null
  getDocument:    <T = Record<string, unknown>>(id: string) => Promise<(T & { id: string }) | null>
  setDocument:    <T extends Record<string, unknown>>(id: string, data: T) => Promise<boolean>
  addDocument:    <T extends Record<string, unknown>>(data: T) => Promise<string | null>
  updateDocument: <T extends Record<string, unknown>>(id: string, data: T) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>
  getCollection:  <T = Record<string, unknown>>(
    conditions?: [string, WhereFilterOp, unknown][],
    sortBy?: string | null,
    limitCount?: number
  ) => Promise<(T & { id: string })[]>
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/**
 * Throws a descriptive error when the required Firebase services are not
 * available. Centralising this avoids duplicating the guard in every method.
 *
 * @param {boolean} [requireAuth=true] - Also assert that a user is signed in
 * @param {string} [operationName='operation'] - Name used in the error message
 */
function assertFirebaseReady(
  requireAuth: boolean = true,
  operationName: string = 'operation'
): void {
  if (requireAuth && !auth?.currentUser) {
    throw new Error(`[${operationName}] requires authentication`)
  }
  if (!db) {
    throw new Error(`[${operationName}] requires Firebase configuration`)
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides typed Firestore CRUD operations scoped to a single collection.
 *
 * All operations:
 * - Set `loading` to `true` while in flight
 * - Set `error` on failure (or clear it on success)
 * - Return a typed result so callers don't need to handle Firestore types directly
 *
 * @param {string} collectionName - The Firestore collection to operate on
 * @returns {UseFirestoreResult}
 */
export function useFirestore(collectionName: string): UseFirestoreResult {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Read — single document
  // ---------------------------------------------------------------------------

  const getDocument = useCallback(async <T = Record<string, unknown>>(
    id: string
  ): Promise<(T & { id: string }) | null> => {
    setLoading(true)
    setError(null)
    try {
      assertFirebaseReady(true, 'getDocument')
      const docRef = doc(db!, collectionName, id)
      const snapshot = await getDoc(docRef)
      return snapshot.exists()
        ? { id: snapshot.id, ...snapshot.data() } as (T & { id: string })
        : null
    } catch (err: unknown) {
      logger.warn(`[getDocument] Error in "${collectionName}":`, err)
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  // ---------------------------------------------------------------------------
  // Write — set (merge) document
  // ---------------------------------------------------------------------------

  const setDocument = useCallback(async <T extends Record<string, unknown>>(
    id: string,
    data: T
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      assertFirebaseReady(true, 'setDocument')
      const docRef = doc(db!, collectionName, id)
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
      return true
    } catch (err: unknown) {
      logger.warn(`[setDocument] Error in "${collectionName}":`, err)
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  // ---------------------------------------------------------------------------
  // Write — add new document (auto-ID)
  // ---------------------------------------------------------------------------

  const addDocument = useCallback(async <T extends Record<string, unknown>>(
    data: T
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      assertFirebaseReady(true, 'addDocument')
      const collectionRef = collection(db!, collectionName)
      const newDocRef = await addDoc(collectionRef, { ...data, createdAt: serverTimestamp() })
      return newDocRef.id
    } catch (err: unknown) {
      logger.warn(`[addDocument] Error in "${collectionName}":`, err)
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  // ---------------------------------------------------------------------------
  // Write — partial update
  // ---------------------------------------------------------------------------

  const updateDocument = useCallback(async <T extends Record<string, unknown>>(
    id: string,
    data: T
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      assertFirebaseReady(true, 'updateDocument')
      const docRef = doc(db!, collectionName, id)
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      return true
    } catch (err: unknown) {
      logger.warn(`[updateDocument] Error in "${collectionName}":`, err)
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  // ---------------------------------------------------------------------------
  // Write — delete document
  // ---------------------------------------------------------------------------

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      assertFirebaseReady(true, 'deleteDocument')
      await deleteDoc(doc(db!, collectionName, id))
      return true
    } catch (err: unknown) {
      logger.warn(`[deleteDocument] Error in "${collectionName}":`, err)
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  // ---------------------------------------------------------------------------
  // Read — collection with optional filter, sort, and limit
  // ---------------------------------------------------------------------------

  /**
   * @param {[string, WhereFilterOp, unknown][]} [conditions=[]] - Firestore `where` clauses
   * @param {string | null} [sortBy=null] - Field name to sort results by (ascending)
   * @param {number} [limitCount=100] - Maximum number of documents to return
   * @returns {Promise<(T & { id: string })[]>} Documents with their IDs merged in
   */
  const getCollection = useCallback(async <T = Record<string, unknown>>(
    conditions: [string, WhereFilterOp, unknown][] = [],
    sortBy: string | null = null,
    limitCount: number = 100
  ): Promise<(T & { id: string })[]> => {
    setLoading(true)
    setError(null)
    try {
      // getCollection does not require auth — public read access is allowed
      assertFirebaseReady(false, 'getCollection')

      const constraints: QueryConstraint[] = [
        ...conditions.map(([field, operator, value]) => where(field, operator, value)),
        ...(sortBy ? [orderBy(sortBy)] : []),
        limit(limitCount),
      ]

      const collectionQuery = query(collection(db!, collectionName), ...constraints)
      const snapshot = await getDocs(collectionQuery)

      return snapshot.docs.map(
        (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() } as (T & { id: string }))
      )
    } catch (err: unknown) {
      logger.warn(`[getCollection] Error in "${collectionName}":`, err)
      setError(err instanceof Error ? err.message : String(err))
      return []
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  return {
    loading,
    error,
    getDocument,
    setDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    getCollection,
  }
}
