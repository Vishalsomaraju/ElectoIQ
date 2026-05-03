// src/hooks/useFirestore.ts
import { useState, useCallback } from 'react'
import { logger } from '../utils/logger'
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, WhereFilterOp, QueryConstraint
} from 'firebase/firestore'
import { auth, db } from '../services/firebase'

export interface UseFirestoreResult {
  loading: boolean
  error: string | null
  getDocument: <T = Record<string, unknown>>(id: string) => Promise<(T & { id: string }) | null>
  setDocument: <T extends Record<string, unknown>>(id: string, data: T) => Promise<boolean>
  addDocument: <T extends Record<string, unknown>>(data: T) => Promise<string | null>
  updateDocument: <T extends Record<string, unknown>>(id: string, data: T) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>
  getCollection: <T = Record<string, unknown>>(conditions?: [string, WhereFilterOp, unknown][], sortBy?: string | null, limitCount?: number) => Promise<(T & { id: string })[]>
}

/**
 * Custom hook for Firestore CRUD operations on a given collection.
 *
 * @param {string} collectionName - The Firestore collection to operate on
 */
export function useFirestore(collectionName: string): UseFirestoreResult {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getDocument = useCallback(async <T = Record<string, unknown>>(id: string): Promise<(T & { id: string }) | null> => {
    setLoading(true)
    setError(null)
    try {
      if (!auth?.currentUser) throw new Error('[getDocument] requires authentication')
      if (!db) throw new Error('[getDocument] requires Firebase configuration')
      const ref = doc(db, collectionName, id)
      const snap = await getDoc(ref)
      return snap.exists() ? { id: snap.id, ...snap.data() } as (T & { id: string }) : null
    } catch (err: unknown) {
      logger.warn(`[getDocument] Error in ${collectionName}:`, err)
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const setDocument = useCallback(async <T extends Record<string, unknown>>(id: string, data: T): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      if (!auth?.currentUser) throw new Error('[setDocument] requires authentication')
      if (!db) throw new Error('[setDocument] requires Firebase configuration')
      const ref = doc(db, collectionName, id)
      await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
      return true
    } catch (err: unknown) {
      logger.warn(`[setDocument] Error in ${collectionName}:`, err)
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const addDocument = useCallback(async <T extends Record<string, unknown>>(data: T): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      if (!auth?.currentUser) throw new Error('[addDocument] requires authentication')
      if (!db) throw new Error('[addDocument] requires Firebase configuration')
      const ref = collection(db, collectionName)
      const docRef = await addDoc(ref, { ...data, createdAt: serverTimestamp() })
      return docRef.id
    } catch (err: unknown) {
      logger.warn(`[addDocument] Error in ${collectionName}:`, err)
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const updateDocument = useCallback(async <T extends Record<string, unknown>>(id: string, data: T): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      if (!auth?.currentUser) throw new Error('[updateDocument] requires authentication')
      if (!db) throw new Error('[updateDocument] requires Firebase configuration')
      const ref = doc(db, collectionName, id)
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
      return true
    } catch (err: unknown) {
      logger.warn(`[updateDocument] Error in ${collectionName}:`, err)
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      if (!auth?.currentUser) throw new Error('[deleteDocument] requires authentication')
      if (!db) throw new Error('[deleteDocument] requires Firebase configuration')
      await deleteDoc(doc(db, collectionName, id))
      return true
    } catch (err: unknown) {
      logger.warn(`[deleteDocument] Error in ${collectionName}:`, err)
      setError(err instanceof Error ? err.message : String(err))
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const getCollection = useCallback(async <T = Record<string, unknown>>(conditions: [string, WhereFilterOp, unknown][] = [], sortBy: string | null = null, limitCount: number = 100): Promise<(T & { id: string })[]> => {
    setLoading(true)
    setError(null)
    try {
      if (!db) throw new Error('[getCollection] requires Firebase configuration')
      let q = query(collection(db, collectionName))
      const constraints: QueryConstraint[] = conditions.map(([field, op, val]) => where(field, op, val))
      if (sortBy) constraints.push(orderBy(sortBy))
      constraints.push(limit(limitCount))
      q = query(q, ...constraints)
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as (T & { id: string })))
    } catch (err: unknown) {
      logger.warn(`[getCollection] Error in ${collectionName}:`, err)
      setError(err instanceof Error ? err.message : String(err))
      return []
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  return { loading, error, getDocument, setDocument, addDocument, updateDocument, deleteDocument, getCollection }
}
