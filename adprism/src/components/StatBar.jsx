function Stat({ value, label, accent }) {
  return (
    <>
      <span style={{ fontWeight: 700, color: accent || 'var(--ink)', fontSize: 13 }}>{value}</span>
      <span style={{ color: 'var(--soft)', fontSize: 13 }}>{label}</span>
    </>
  )
}

export default function StatBar({ campaigns }) {
  // Filter to today's campaigns only
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayCampaigns = campaigns.filter(c => {
    if (!c.published_at) return false
    const date = c.published_at.toDate ? c.published_at.toDate() : new Date(c.published_at)
    return date >= todayStart
  })

  const total  = todayCampaigns.length
  const videos = todayCampaigns.filter(c => c.campaign_type?.includes('Video')).length
  const brands = [...new Set(todayCampaigns.map(c => c.brand))].length

  const freq = {}
  todayCampaigns.forEach(c => { if (c.industry) freq[c.industry] = (freq[c.industry] || 0) + 1 })
  const trending = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0]

  const sep = <span style={{ color: 'var(--ghost)' }}>·</span>

  return (
    <div className="glass" style={{
      padding: '8px 20px',
      borderBottom: '1px solid var(--border)',
      borderRadius: 0,
      display: 'flex', alignItems: 'center', gap: 6,
      flexWrap: 'wrap',
      flexShrink: 0,
    }}>
      <Stat value={total}  label="new today" />
      {sep}
      <Stat value={brands} label="brands tracked" />
      {sep}
      <Stat value={videos} label="video ads" />
      {trending && (
        <span className="trending-stat" style={{ display: 'contents' }}>
          {sep}
          <Stat value={`↑ ${trending}`} label="trending" accent="var(--rose)" />
        </span>
      )}
    </div>
  )
}
