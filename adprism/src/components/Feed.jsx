import { useRef, useEffect, useCallback } from 'react'
import CampaignCard from './CampaignCard'

const REGION_ORDER = ['Taiwan', 'Global', 'APAC', 'Japan', 'Korea', 'UK', 'US', 'EU']

function dateLabel(ts) {
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((today - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function DateBreak({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '4px 0', padding: '0 4px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ghost)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
    </div>
  )
}


export default function Feed({ campaigns, search, loading, savedIds = [], onToggleSave, onDismiss, loadMore, hasMore }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!hasMore || !loadMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ghost)', fontSize: 13 }}>
        Loading{'\u2026'}
      </div>
    )
  }

  const filtered = search
    ? campaigns.filter(c =>
        [c.title, c.title_zh, c.brand, c.summary, c.summary_zh]
          .filter(Boolean)
          .some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : campaigns

  if (!filtered.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ghost)', fontSize: 13 }}>
        No campaigns found
      </div>
    )
  }

  return (
    <div className="feed-scroll" style={{
      flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
      padding: '20px 20px 80px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {(() => {
        let lastDate = null
        return filtered.map((c) => {
          const dl = dateLabel(c.published_at)
          const showBreak = dl !== lastDate
          lastDate = dl
          return (
            <div key={c.id} style={{ display: 'contents' }}>
              {showBreak && <DateBreak label={dl} />}
              <CampaignCard
                campaign={c}
                saved={savedIds.includes(c.id)}
                onToggleSave={onToggleSave}
                onDismiss={onDismiss}
              />
            </div>
          )
        })
      })()}
      {/* Sentinel element for infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} style={{
          display: 'flex', justifyContent: 'center', padding: '20px 0',
          color: 'var(--ghost)', fontSize: 12,
        }}>
          Loading more…
        </div>
      )}
    </div>
  )
}
