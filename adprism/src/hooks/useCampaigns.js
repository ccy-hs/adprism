import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  collection, query, where, orderBy,
  limit, onSnapshot, Timestamp, doc, updateDoc, deleteDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'

/* Unfiltered stats — counts all non-dismissed campaigns in Firestore */
export function useGlobalStats() {
  const [all, setAll] = useState([])

  useEffect(() => {
    const q = query(
      collection(db, 'campaigns'),
      orderBy('published_at', 'desc'),
      limit(500)
    )
    const unsub = onSnapshot(q, snap => {
      setAll(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.dismissed))
    })
    return () => unsub()
  }, [])

  const brandList = useMemo(() => {
    const counts = {}
    all.forEach(c => { if (c.brand) counts[c.brand] = (counts[c.brand] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }, [all])

  return useMemo(() => ({
    total:  all.length,
    videos: all.filter(c => c.campaign_type?.includes('CF')).length,
    brands: new Set(all.map(c => c.brand).filter(Boolean)).size,
    brandList,
    allCampaigns: all,
  }), [all, brandList])
}

const PAGE_SIZE = 10
const FETCH_SIZE = 200

export function useCampaigns(filters = {}) {
  const [allCampaigns, setAllCampaigns] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [
    JSON.stringify(filters.regions),
    JSON.stringify(filters.industries),
    JSON.stringify(filters.campaignTypes),
    filters.dateFrom?.toISOString(),
    filters.dateTo?.toISOString(),
  ])

  useEffect(() => {
    setLoading(true)

    let q = collection(db, 'campaigns')
    const constraints = []

    if (filters.regions?.length) {
      constraints.push(where('region', 'array-contains-any', filters.regions))
    }

    if (filters.industries?.length === 1) {
      constraints.push(where('industry', '==', filters.industries[0]))
    }

    if (filters.dateFrom) {
      constraints.push(where('published_at', '>=', Timestamp.fromDate(filters.dateFrom)))
    }
    if (filters.dateTo) {
      constraints.push(where('published_at', '<=', Timestamp.fromDate(filters.dateTo)))
    }

    const sort = orderBy('published_at', 'desc')
    constraints.push(sort)
    constraints.push(limit(FETCH_SIZE))

    const unsubscribe = onSnapshot(
      query(q, ...constraints),
      (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

        const filtered = docs.filter(doc => {
          const typeMatch = !filters.campaignTypes?.length
            || doc.campaign_type?.some(t => filters.campaignTypes.includes(t))
          const industryMatch = !filters.industries?.length || filters.industries.length === 1
            || filters.industries.includes(doc.industry)
          return typeMatch && industryMatch && !doc.dismissed
        })

        setAllCampaigns(filtered)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [
    JSON.stringify(filters.regions),
    JSON.stringify(filters.industries),
    JSON.stringify(filters.campaignTypes),
    filters.dateFrom?.toISOString(),
    filters.dateTo?.toISOString(),
    filters.sortBy,
  ])

  const dismissCampaign = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'campaigns', id))
    } catch (err) {
      console.error('Dismiss failed:', err)
    }
  }, [])

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE)
  }, [])

  const hasMore = visibleCount < allCampaigns.length

  return {
    campaigns: allCampaigns.slice(0, visibleCount),
    loading,
    error,
    dismissCampaign,
    loadMore,
    hasMore,
  }
}
