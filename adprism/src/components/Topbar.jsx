import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Topbar({ search, onSearch, sortBy, onSort, onMenuToggle }) {
  const [searchFocused, setSearchFocused] = useState(false)
  const btn = (label, value) => {
    const isActive = sortBy === value
    return (
      <div
        className="topbar-sort-btn"
        onClick={() => onSort(value)}
        style={{
          height: 30, padding: '0 14px',
          display: 'flex', alignItems: 'center',
          fontSize: 13, cursor: 'pointer',
          borderRadius: 9999,
          position: 'relative',
          color: isActive ? 'var(--ink)' : 'var(--ghost)',
          fontWeight: isActive ? 600 : 400,
          whiteSpace: 'nowrap', userSelect: 'none',
          transition: 'color 200ms ease',
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
        {isActive && (
          <motion.div
            layoutId="topbar-lamp"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 9999,
              background: 'var(--color-surface-active)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Lamp bar */}
            <div style={{
              position: 'absolute',
              top: -1,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 20,
              height: 2.5,
              borderRadius: '2px 2px 0 0',
              background: 'var(--rose)',
            }}>
              {/* Glow layers */}
              <div style={{
                position: 'absolute',
                width: 32, height: 12,
                borderRadius: 9999,
                background: 'rgba(235, 129, 120, 0.20)',
                filter: 'blur(6px)',
                top: -5, left: -6,
              }} />
              <div style={{
                position: 'absolute',
                width: 20, height: 10,
                borderRadius: 9999,
                background: 'rgba(235, 129, 120, 0.15)',
                filter: 'blur(5px)',
                top: -3, left: 0,
              }} />
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="glass" style={{
      padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
      borderRadius: 0,
      flexShrink: 0,
    }}>
      <div className="topbar-inner" style={{
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Hamburger — mobile only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div
            className="menu-toggle"
            onClick={onMenuToggle}
            style={{
              width: 34, height: 34, borderRadius: 14,
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
          </div>

          {/* Search */}
          <div style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 7,
            border: searchFocused ? '1px solid var(--rose)' : '1px solid var(--border)',
            borderRadius: 14,
            padding: '0 10px', height: 34,
            background: 'var(--color-surface)',
            backdropFilter: 'blur(12px)',
            boxShadow: searchFocused ? '0 0 0 3px rgba(235, 129, 120, 0.15)' : 'none',
            transition: 'border-color 200ms ease, box-shadow 200ms ease',
          }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"
              stroke={searchFocused ? 'var(--rose)' : 'var(--ghost)'}
              strokeWidth="1.4" strokeLinecap="round"
              style={{ transition: 'stroke 200ms ease', flexShrink: 0 }}
            >
              <circle cx="5" cy="5" r="3.5" /><line x1="8" y1="8" x2="11" y2="11" />
            </svg>
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search brands, campaigns…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--ink)',
                background: 'transparent', fontFamily: 'var(--f)',
                minWidth: 0,
              }}
            />
            {search && (
              <span onClick={() => onSearch('')} style={{ cursor: 'pointer', color: 'var(--ghost)', fontSize: 16, lineHeight: 1 }}>×</span>
            )}
          </div>
        </div>

        {/* Sort buttons — pill container */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          padding: 3,
          borderRadius: 9999,
          border: '1px solid var(--border2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {btn('All', 'latest')}
          {btn('Industry', 'industry')}
          {btn('Brands', 'brands')}
          {btn('Media', 'media')}
        </div>
      </div>
    </div>
  )
}
