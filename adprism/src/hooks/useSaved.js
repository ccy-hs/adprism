import { useState, useEffect } from 'react'
import { doc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useSaved() {
  const [savedIds, setSavedIds] = useState([])

  // Subscribe to all campaigns where saved === true
  useEffect(() => {
    const q = query(collection(db, 'campaigns'), where('saved', '==', true))
    const unsub = onSnapshot(q, (snap) => {
      setSavedIds(snap.docs.map(d => d.id))
    }, (err) => {
      console.error('Saved subscription error:', err)
    })
    return () => unsub()
  }, [])

  const toggleSave = async (id) => {
    const wasSaved = savedIds.includes(id)
    // Optimistic update
    setSavedIds(prev => wasSaved ? prev.filter(i => i !== id) : [...prev, id])
    try {
      await updateDoc(doc(db, 'campaigns', id), { saved: !wasSaved })
    } catch (err) {
      console.error('Toggle save failed:', err)
      // Revert on failure
      setSavedIds(prev => wasSaved ? [...prev, id] : prev.filter(i => i !== id))
    }
  }

  const isSaved = (id) => savedIds.includes(id)

  return { savedIds, toggleSave, isSaved }
}
