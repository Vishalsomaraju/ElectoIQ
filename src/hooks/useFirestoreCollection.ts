// ─── Google Service: Cloud Firestore — Real-time subscriptions ────────
// Purpose: Live onSnapshot listeners for real-time data sync
// SDK: firebase/firestore ^12.x
// Docs: https://firebase.google.com/docs/firestore/query-data/listen
import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, Timestamp, QueryConstraint } from 'firebase/firestore'
import { db } from '../services/firebase'
import { logger } from '../utils/logger'

export interface UseFirestoreCollectionOptions {
  limitCount?: number
  orderByField?: string | null
}

export interface UseFirestoreCollectionResult<T> {
  data: (T & { id: string })[]
  loading: boolean
  error: string | null
  isConnected: boolean
}

/**
 * Real-time Firestore collection hook using onSnapshot.
 * Automatically unsubscribes on unmount.
 * @param {string} collectionName - Collection to subscribe to
 * @param {Object} [options] - { limitCount?: number, orderByField?: string }
 */
export function useFirestoreCollection<T = Record<string, unknown>>(collectionName: string, options: UseFirestoreCollectionOptions = {}): UseFirestoreCollectionResult<T> {
  const { limitCount = 50, orderByField = null } = options
  const [data, setData] = useState<(T & { id: string })[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      setError('Firebase not configured')
      return
    }
    const constraints: QueryConstraint[] = []
    if (orderByField) constraints.push(orderBy(orderByField))
    constraints.push(limit(limitCount))
    const q = query(collection(db, collectionName), ...constraints)

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => {
          const raw = doc.data()
          const out: Record<string, unknown> = { id: doc.id }
          for (const [k, v] of Object.entries(raw)) {
            out[k] = v instanceof Timestamp ? v.toDate() : v
          }
          return out as (T & { id: string })
        })

        setData(docs)
        setLoading(false)
        setIsConnected(true)
        setError(null)
      },
      (err) => {
        logger.warn(`[useFirestoreCollection] ${collectionName}:`, err)
        setError(err.message)
        setLoading(false)
        setIsConnected(false)
      }
    )

    return () => {
      try {
        unsubscribe()
      } catch (e) {
        logger.warn('[useFirestoreCollection] cleanup:', e)
      }
    }
  }, [collectionName, limitCount, orderByField])

  return { data, loading, error, isConnected }
}
