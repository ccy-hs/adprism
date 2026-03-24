import { useState, useMemo, useCallback, useEffect } from 'react'
import './styles/global.css'
import Sidebar   from './components/Sidebar'
import Topbar    from './components/Topbar'
import StatBar   from './components/StatBar'
import Feed      from './components/Feed'
import { useCampaigns, useGlobalStats } from './hooks/useCampaigns'
import { useFilters }   from './hooks/useFilters'
import { useSaved }     from './hooks/useSaved'
import NotificationPrompt from './components/NotificationPrompt'
import { initForegroundMessaging } from './lib/firebase'

export default function App() {

  useEffect(() => { initForegroundMessaging() }, [])

  const { filters, toggle, setSort, setSearch, clearFilter, reset } = useFilters()
  const { campaigns, loading, dismissCampaign, loadMore, hasMore } = useCampaigns(filters)
  const { savedIds, toggleSave, isSaved } = useSaved()
  const globalStats = useGlobalStats()
  const [view, setView] = useState('feed')
  const [brandFilter, setBrandFilter] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subVisible, setSubVisible] = useState(10)

  // Helper: distinguish YouTube sources from RSS/website sources
  const isYouTube = (c) =>
    c.source_url?.includes('youtube.com') || c.source_url?.includes('youtu.be')

  // Helper: paginate any filtered list from globalStats
  const allCampaigns = globalStats.allCampaigns || []

  // Apply sidebar filters to any campaign list
  const applyFilters = useCallback((list) => {
    return list.filter(c => {
      const indMatch = !filters.industries?.length || filters.industries.includes(c.industry)
      const typeMatch = !filters.campaignTypes?.length || c.campaign_type?.some(t => filters.campaignTypes.includes(t))
      const regionMatch = !filters.regions?.length || c.region?.some(r => filters.regions.includes(r))
      return indMatch && typeMatch && regionMatch
    })
  }, [filters.industries, filters.campaignTypes, filters.regions])

  const allSaved = useMemo(() =>
    applyFilters(allCampaigns.filter(c => savedIds.includes(c.id))),
    [allCampaigns, savedIds, applyFilters]
  )

  const allVideos = useMemo(() =>
    applyFilters(allCampaigns.filter(c => c.campaign_type?.includes('CF'))),
    [allCampaigns, applyFilters]
  )

  const allIndustry = useMemo(() =>
    applyFilters(allCampaigns.filter(c => c.category === 2)),
    [allCampaigns, applyFilters]
  )

  const allBrandsCat = useMemo(() =>
    applyFilters(allCampaigns.filter(c => c.category === 1 || c.category === 3 || (c.category === 4 && isYouTube(c)))),
    [allCampaigns, applyFilters]
  )

  const allMedia = useMemo(() =>
    applyFilters(allCampaigns.filter(c => c.category === 4 && !isYouTube(c))),
    [allCampaigns, applyFilters]
  )

  // Determine which sub-view needs its own pagination
  const isSubView = view === 'saved' || view === 'videos' || filters.sortBy !== 'latest'
  const subAll = useMemo(() => {
    // Start with the base list for the current view
    let base = []
    if (view === 'saved') base = allSaved
    else if (view === 'videos') base = allVideos
    else if (filters.sortBy !== 'latest') {
      if (filters.sortBy === 'industry') base = allIndustry
      else if (filters.sortBy === 'brands') base = allBrandsCat
      else if (filters.sortBy === 'media') base = allMedia
    }
    // For saved/videos views, also apply topbar sort filter on top
    if ((view === 'saved' || view === 'videos') && filters.sortBy !== 'latest') {
      if (filters.sortBy === 'industry') base = base.filter(c => c.category === 2)
      else if (filters.sortBy === 'brands') base = base.filter(c => c.category === 1 || c.category === 3 || (c.category === 4 && isYouTube(c)))
      else if (filters.sortBy === 'media') base = base.filter(c => c.category === 4 && !isYouTube(c))
    }
    return base
  }, [view, filters.sortBy, allSaved, allVideos, allIndustry, allBrandsCat, allMedia])

  const subPage = subAll.slice(0, subVisible)
  const subHasMore = subVisible < subAll.length
  const subLoadMore = useCallback(() => setSubVisible(v => v + 10), [])

  const handleViewChange = (v) => {
    setView(v)
    if (v !== 'brand-feed') setBrandFilter(null)
    setSubVisible(10)
  }

  // Reset pagination when sort changes; keep current sidebar view
  const handleSort = useCallback((s) => {
    setSort(s)
    setSubVisible(10)
  }, [setSort])

  const stats = {
    total:  globalStats.total,
    videos: globalStats.videos,
    saved:  savedIds.length,
    brands: globalStats.brands,
  }

  const brandList = globalStats.brandList || []

  return (
    <div className="app-shell" style={{
      display: 'flex',
      height: '100dvh', maxHeight: '100dvh',
      fontFamily: 'var(--f)',
      color: 'var(--ink)',
    }}>
      <Sidebar
        filters={filters}
        toggle={toggle}
        clearFilter={clearFilter}
        resetFilters={reset}
        stats={stats}
        view={view === 'brand-feed' ? 'brands' : view}
        onViewChange={handleViewChange}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div className="mobile-sticky-header">
          <Topbar
            search={filters.search}
            onSearch={setSearch}
            sortBy={filters.sortBy}
            onSort={handleSort}
            onMenuToggle={() => setSidebarOpen(v => !v)}
          />
          <StatBar campaigns={globalStats.allCampaigns || []} />
        </div>

        <NotificationPrompt />

        {(view === 'saved' || view === 'videos' || (view === 'feed' && filters.sortBy !== 'latest')) ? (
          <Feed
            campaigns={subPage}
            search={filters.search}
            loading={false}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onDismiss={dismissCampaign}
            loadMore={subLoadMore}
            hasMore={subHasMore}
          />
        ) : view === 'brands' ? (
          <div style={{
            flex: 1, overflowY: 'auto', padding: 20,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {(() => {
              const INDUSTRY_NORMALIZE = { Tech: 'Technology', Auto: 'Automotive', 'F&B': 'Food & Beverage' }
              // Filter campaigns by sidebar + topbar filters
              let filteredCampaigns = applyFilters(allCampaigns)
              if (filters.sortBy === 'industry') filteredCampaigns = filteredCampaigns.filter(c => c.category === 2)
              else if (filters.sortBy === 'brands') filteredCampaigns = filteredCampaigns.filter(c => c.category === 1 || c.category === 3 || (c.category === 4 && isYouTube(c)))
              else if (filters.sortBy === 'media') filteredCampaigns = filteredCampaigns.filter(c => c.category === 4 && !isYouTube(c))
              const industryMap = {}
              filteredCampaigns.forEach(c => {
                if (c.brand && c.industry) industryMap[c.brand] = INDUSTRY_NORMALIZE[c.industry] || c.industry
              })
              // Build brand list from filtered campaigns
              const counts = {}
              filteredCampaigns.forEach(c => { if (c.brand) counts[c.brand] = (counts[c.brand] || 0) + 1 })
              const filteredBrandList = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
              const grouped = {}
              filteredBrandList.forEach(([brand, count]) => {
                const ind = industryMap[brand] || 'Other'
                if (!grouped[ind]) grouped[ind] = []
                grouped[ind].push([brand, count])
              })
              const industries = Object.keys(grouped).sort((a, b) => a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b))
              return industries.map(ind => (
                <div key={ind} style={{ display: 'contents' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    margin: '4px 0', padding: '0 4px',
                  }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ghost)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{ind}</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
                  </div>
                  {grouped[ind].map(([brand, count]) => (
                    <div
                      key={brand}
                      className="glass brand-row"
                      style={{
                        padding: '12px 18px', borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 200ms ease, box-shadow 200ms ease, transform 150ms ease',
                      }}
                      onClick={() => { setBrandFilter(brand); setView('brand-feed') }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{brand}</span>
                      <span style={{ fontSize: 12, color: 'var(--ghost)' }}>{count} campaign{count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              ))
            })()}
          </div>
        ) : view === 'brand-feed' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: '1px solid var(--border)',
            }}>
              <span
                onClick={() => handleViewChange('brands')}
                style={{ cursor: 'pointer', fontSize: 13, color: 'var(--rose)' }}
              >← Brands</span>
              <span style={{ color: 'var(--ghost)' }}>·</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{brandFilter}</span>
            </div>
            <Feed
              campaigns={(() => {
                let list = (globalStats.allCampaigns || []).filter(c => c.brand === brandFilter)
                if (filters.sortBy === 'industry') list = list.filter(c => c.category === 2)
                else if (filters.sortBy === 'brands') list = list.filter(c => c.category === 1 || c.category === 3 || (c.category === 4 && isYouTube(c)))
                else if (filters.sortBy === 'media') list = list.filter(c => c.category === 4 && !isYouTube(c))
                return list
              })()}
              search={filters.search}
              loading={loading}
              savedIds={savedIds}
              onToggleSave={toggleSave}
              onDismiss={dismissCampaign}
              loadMore={() => {}}
              hasMore={false}
            />
          </div>
        ) : (
          <Feed
            campaigns={campaigns}
            search={filters.search}
            loading={loading}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onDismiss={dismissCampaign}
            loadMore={loadMore}
            hasMore={hasMore}
          />
        )}
      </div>
    </div>
  )
}
