import { motion } from 'framer-motion'

const INDUSTRIES    = ['Technology', 'FMCG', 'Fashion', 'Automotive', 'Food & Beverage', 'Homeware', 'Retail', 'Alcohol', 'Travel', 'Finance']
const CAMPAIGN_TYPES = ['Launch', 'Awareness', 'Performance', 'Video', 'Social', 'OOH', 'Branded Content', 'Influencer']
const REGIONS       = ['Taiwan', 'Hong Kong', 'APAC', 'Japan', 'Korea', 'Global', 'UK', 'US']

const CHIP_COLORS = {
  industry:     { border: 'var(--blue-t)',  bg: 'var(--blue-bg)',  color: 'var(--blue-t)' },
  campaignType: { border: 'var(--sand-t)',  bg: 'var(--sand-bg)',  color: 'var(--sand-t)' },
  region:       { border: 'var(--sage-t)',  bg: 'var(--sage-bg)',  color: 'var(--sage-t)' },
}

function Chip({ label, active, onToggle, group = 'industry' }) {
  const c = CHIP_COLORS[group] || CHIP_COLORS.industry
  return (
    <span
      onClick={() => onToggle(label)}
      style={{
        fontSize: 11, cursor: 'pointer',
        padding: '3px 10px', borderRadius: 9999,
        border: `1px solid ${active ? c.border : 'var(--border2)'}`,
        background: active ? c.bg : 'transparent',
        color: active ? c.color : 'var(--mid)',
        fontWeight: active ? 600 : 400,
        transition: 'all 120ms ease',
        backdropFilter: 'blur(8px)',
      }}
    >
      {label}
    </span>
  )
}

function NavItem({ label, count, active, hot, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 12px', borderRadius: 14, cursor: 'pointer',
        position: 'relative',
        color: active ? 'var(--ink)' : 'var(--mid)',
        fontWeight: active ? 600 : 400, fontSize: 13,
        fontFamily: "'DM Serif Display', serif",
        letterSpacing: '0.03em',
        transition: 'color 200ms ease',
      }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
      {count != null && (
        <span style={{
          fontSize: 11, fontWeight: 300,
          fontFamily: "'DM Sans', sans-serif",
          color: 'var(--rose)',
          position: 'relative', zIndex: 1,
        }}>
          {count}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="sidebar-nav"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            background: 'var(--color-surface-active)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Left lamp bar */}
          <div style={{
            position: 'absolute',
            left: -1,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2.5,
            height: 18,
            borderRadius: '2px 0 0 2px',
            background: 'var(--rose)',
          }}>
            {/* Glow layers */}
            <div style={{
              position: 'absolute',
              width: 12, height: 28,
              borderRadius: 9999,
              background: 'rgba(235, 129, 120, 0.20)',
              filter: 'blur(6px)',
              top: -5, left: -5,
            }} />
            <div style={{
              position: 'absolute',
              width: 10, height: 20,
              borderRadius: 9999,
              background: 'rgba(235, 129, 120, 0.15)',
              filter: 'blur(5px)',
              top: -1, left: -3,
            }} />
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ClearButton({ onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 10, fontWeight: 500, color: 'var(--ghost)',
        cursor: 'pointer', padding: '0 4px',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        transition: 'color 120ms ease',
      }}
      onMouseEnter={e => e.target.style.color = 'var(--mid)'}
      onMouseLeave={e => e.target.style.color = 'var(--ghost)'}
    >
      Clear
    </span>
  )
}

export default function Sidebar({ filters, toggle, clearFilter, resetFilters, stats, view, onViewChange, open, onClose }) {
  const hasActiveFilters = filters.industries.length > 0 || filters.campaignTypes.length > 0 || filters.regions.length > 0
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`glass sidebar${open ? ' open' : ''}`} style={{
        width: 240, minWidth: 240,
        borderRight: '1px solid var(--border)',
        borderRadius: 0,
        display: 'flex', flexDirection: 'column',
        padding: '16px 14px', gap: 16,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ paddingLeft: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, fontSize: 32, fontFamily: "'DM Serif Display', serif", fontWeight: 400, color: 'var(--ink)', letterSpacing: '.02em' }}>
            AdPrism<span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--rose)', marginLeft: 2, marginBottom: 2, flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--soft)', marginTop: 2 }}>
            Campaign Insight Instant Radar
          </div>
        </div>

        <div style={{ height: 8 }} />

        {/* Views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 300, color: 'var(--ghost)', letterSpacing: '.3em', textTransform: 'uppercase', padding: '0 4px', marginBottom: 4 }}>
            Views
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 2,
            padding: 3,
            borderRadius: 16,
            border: '1px solid var(--border2)',
          }}>
            <NavItem label="Feed"   count={stats?.total}  active={view === 'feed'}   onClick={() => { onViewChange('feed'); onClose?.() }} />
            <NavItem label="Saved"  count={stats?.saved}  active={view === 'saved'}  onClick={() => { onViewChange('saved'); onClose?.() }} />
            <NavItem label="Commercial Films" count={stats?.videos} active={view === 'videos'} hot onClick={() => { onViewChange('videos'); onClose?.() }} />
            <NavItem label="Categories" count={stats?.brands} active={view === 'brands'} onClick={() => { onViewChange('brands'); onClose?.() }} />
          </div>
        </div>

        {/* Industry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 300, color: 'var(--ghost)', letterSpacing: '.3em', textTransform: 'uppercase', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Industry
            {filters.industries.length > 0 && <ClearButton onClick={() => clearFilter('industries')} />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {INDUSTRIES.map(i => (
              <Chip key={i} label={i} active={filters.industries.includes(i)} onToggle={v => toggle('industries', v)} group="industry" />
            ))}
          </div>
        </div>

        {/* Campaign Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 300, color: 'var(--ghost)', letterSpacing: '.3em', textTransform: 'uppercase', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Campaign Type
            {filters.campaignTypes.length > 0 && <ClearButton onClick={() => clearFilter('campaignTypes')} />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {CAMPAIGN_TYPES.map(t => (
              <Chip key={t} label={t} active={filters.campaignTypes.includes(t)} onToggle={v => toggle('campaignTypes', v)} group="campaignType" />
            ))}
          </div>
        </div>

        {/* Region */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 300, color: 'var(--ghost)', letterSpacing: '.3em', textTransform: 'uppercase', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Region
            {filters.regions.length > 0 && <ClearButton onClick={() => clearFilter('regions')} />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {REGIONS.map(r => (
              <Chip key={r} label={r} active={filters.regions.includes(r)} onToggle={v => toggle('regions', v)} group="region" />
            ))}
          </div>
        </div>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <div
            onClick={resetFilters}
            style={{
              fontSize: 12, fontWeight: 500, color: 'var(--ghost)',
              cursor: 'pointer', padding: '8px 12px', borderRadius: 10,
              textAlign: 'center', border: '1px solid var(--border2)',
              transition: 'all 120ms ease',
            }}
            onMouseEnter={e => { e.target.style.color = 'var(--mid)'; e.target.style.borderColor = 'var(--mid)' }}
            onMouseLeave={e => { e.target.style.color = 'var(--ghost)'; e.target.style.borderColor = 'var(--border2)' }}
          >
            Clear all filters
          </div>
        )}

        {/* Footer — pinned to bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 16, textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--ghost)', letterSpacing: '0.05em' }}>
            Made by Cynthia
          </span>
        </div>
      </div>
    </>
  )
}
