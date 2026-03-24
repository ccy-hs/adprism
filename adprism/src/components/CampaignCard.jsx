import { useState } from 'react'
import HeartSaveButton from './HeartSaveButton'

const TAG_STYLES = {
  // Industries — blue (teal)
  Technology:       { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  FMCG:             { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  Fashion:          { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  Automotive:       { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  'Food & Beverage': { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  Homeware:         { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  Retail:           { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  Alcohol:          { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  Travel:           { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  Finance:          { bg: 'var(--blue-bg)', color: 'var(--blue-t)' },
  // Campaign Types — sand (gold)
  Launch:           { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  Awareness:        { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  OOH:              { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  Social:           { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  Performance:      { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  Video:            { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  'Branded Content': { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  Influencer:       { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  CF:               { bg: 'var(--sand-bg)', color: 'var(--sand-t)' },
  // Regions — sage (lime)
  Global:           { bg: 'var(--sage-bg)', color: 'var(--sage-t)' },
  Taiwan:           { bg: 'var(--sage-bg)', color: 'var(--sage-t)' },
  Japan:            { bg: 'var(--sage-bg)', color: 'var(--sage-t)' },
  Korea:            { bg: 'var(--sage-bg)', color: 'var(--sage-t)' },
  'Hong Kong':      { bg: 'var(--sage-bg)', color: 'var(--sage-t)' },
  UK:               { bg: 'var(--sage-bg)', color: 'var(--sage-t)' },
}

const LANG_FLAGS = { ja: '\u{1F1EF}\u{1F1F5}', ko: '\u{1F1F0}\u{1F1F7}', 'zh-TW': '\u{1F1F9}\u{1F1FC}' }

function isCJK(text, lang) {
  if (!text) return false
  const cjk = text.match(/[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/g)
  // For known CJK-language cards, any CJK character is enough
  if (lang && (lang === 'ko' || lang === 'ja' || lang === 'zh')) return !!(cjk && cjk.length > 0)
  return cjk && cjk.length > text.length * 0.2
}

function MixedText({ text, cjkSpacing, latinSpacing }) {
  if (!text) return null
  // Split text into CJK and non-CJK segments
  const segments = text.match(/([\u3000-\u9fff\uac00-\ud7af\uff00-\uffef\u3040-\u309f\u30a0-\u30ff]+|[^\u3000-\u9fff\uac00-\ud7af\uff00-\uffef\u3040-\u309f\u30a0-\u30ff]+)/g)
  if (!segments) return text
  return segments.map((seg, i) => {
    const isCjk = /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef\u3040-\u309f\u30a0-\u30ff]/.test(seg)
    return <span key={i} style={{ letterSpacing: isCjk ? cjkSpacing : latinSpacing }}>{seg}</span>
  })
}

function Tag({ label }) {
  const s = TAG_STYLES[label] || TAG_STYLES.Global
  return (
    <span style={{
      fontSize: 12, padding: '3px 10px', borderRadius: 9999,
      background: s.bg, color: s.color,
      border: '1px solid var(--border2)',
      backdropFilter: 'blur(8px)',
      fontWeight: 500,
    }}>
      {label}
    </span>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const now  = new Date()
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  // Compare by calendar date, not milliseconds
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const daysDiff = Math.round((today - target) / 86400000)

  const day = date.getDate().toString().padStart(2, '0')
  const mon = date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
  const year = date.getFullYear()
  const dateStr = `${day} ${mon}. ${year}`

  if (daysDiff === 0) return `Today, ${time}`
  if (daysDiff === 1) return `Yesterday, ${time}`
  return `${dateStr}, ${time}`
}

const hasCJK = (t) => /[\u3000-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/.test(t)

export default function CampaignCard({ campaign, saved, onToggleSave, onDismiss }) {
  const [expanded, setExpanded] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    id, title, title_zh, summary, summary_zh,
    original_title, original_summary,
    brand, industry, campaign_type = [],
    region = [], source_url, source_name,
    published_at, language,
    key_message, target_audience, consumer_insight, call_to_action,
    content_type,
    brand_proposition,
    key_takeaway, strategic_implication,
    format_context, the_hook, engagement_tactic, conversion_path,
    category, priority_tier,
  } = campaign

  const effectiveContentType = content_type || 'brand_campaign'

  const CAT_LABELS = { 1: 'Brands', 2: 'Industry', 3: 'Brands', 4: 'Media', 5: 'Brands' }
  const catLabel = CAT_LABELS[category] || null

  const handleDismiss = (e) => {
    e.stopPropagation()
    if (!confirmDelete) { setConfirmDelete(true); return }
    onDismiss?.(id)
    setConfirmDelete(false)
  }

  const hasBreakdown =
    effectiveContentType === 'brand_campaign'
      ? !!(brand_proposition || key_message || target_audience || consumer_insight || call_to_action)
      : effectiveContentType === 'industry_news'
      ? !!(key_takeaway || strategic_implication)
      : effectiveContentType === 'tactical_format'
      ? !!(the_hook || engagement_tactic || conversion_path)
      : false
  const allBreakdownFields = [brand_proposition, key_message, target_audience, consumer_insight, call_to_action, key_takeaway, strategic_implication, format_context, the_hook, engagement_tactic, conversion_path]
  const hasBreakdownCJK = allBreakdownFields.some(t => t && hasCJK(t))
  const breakdownLabel =
    effectiveContentType === 'industry_news' ? 'Industry Insight'
    : effectiveContentType === 'tactical_format' ? 'Tactical Breakdown'
    : 'Strategic Breakdown'
  const isTranslated = language === 'ja' || language === 'ko'
  const flag = LANG_FLAGS[language] || ''

  const displayTitle = showOriginal && original_title ? original_title : (title_zh || title)
  const displaySummary = showOriginal && original_summary ? original_summary : (summary_zh || summary)
  const titleIsCJK = isCJK(displayTitle, language)
  const summaryIsCJK = isCJK(displaySummary, language)
  // Use font based on what's actually displayed, not source language
  const showingOriginal = showOriginal && (original_title || original_summary)
  const displayingChinese = !showingOriginal && (language === 'zh-TW' || language === 'ja' || language === 'ko')
  const displayLang = displayingChinese ? 'zh' : language
  const cjkFont = displayLang === 'ko' ? "'Nanum Gothic'" : displayLang === 'ja' ? "'Noto Sans JP'" : "'Noto Sans TC'"
  const cjkTitleFont = displayLang === 'ko' ? "'Noto Serif KR'" : displayLang === 'ja' ? "'Noto Serif JP'" : "'Noto Serif TC'"

  const cjkSpacing = '0.1em'

  const allTags = [
    industry,
    ...(effectiveContentType === 'industry_news'
      ? campaign_type.filter(t => t === 'Video')
      : campaign_type),
    ...region,
  ].filter(Boolean)

  return (
    <div
      className="glass campaign-card"
      style={{
        borderRadius: 20,
        padding: '16px 18px',
        cursor: source_url ? 'pointer' : 'default',
      }}
      onClick={() => source_url && window.open(source_url, '_blank')}
    >
      {/* Header — desktop */}
      <div className="card-header-desktop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
          <span style={{ fontSize: 12, fontWeight: 300, color: 'var(--mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{brand}</span>
          {catLabel && (
            <span style={{
              fontSize: 10, fontWeight: 300, padding: '1px 6px', borderRadius: 6,
              background: 'transparent', color: 'var(--mid)',
              border: '0.5px solid var(--mid)',
              flexShrink: 0, letterSpacing: '0.08em',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.6, textAlign: 'center',
            }}>
              {catLabel}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: 'var(--ghost)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{formatDate(published_at)}</span>
          {/* Save button */}
          <HeartSaveButton saved={saved} onToggleSave={onToggleSave} id={id} />
          {/* Dismiss button */}
          {confirmDelete ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <span
                onClick={handleDismiss}
                style={{
                  cursor: 'pointer', padding: '2px 8px', borderRadius: 6,
                  background: 'var(--rose)', color: 'var(--color-on-accent)', fontWeight: 600,
                }}
              >
                Delete
              </span>
              <span
                onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
                style={{
                  cursor: 'pointer', padding: '2px 8px', borderRadius: 6,
                  background: 'var(--color-surface-active)', color: 'var(--mid)',
                  border: '1px solid var(--border2)', fontWeight: 500,
                }}
              >
                Cancel
              </span>
            </span>
          ) : (
            <svg
              onClick={handleDismiss}
              width="16" height="16" viewBox="0 0 24 24"
              style={{ cursor: 'pointer', transition: 'color 120ms ease', color: 'var(--ghost)', flexShrink: 0 }}
              title="Remove campaign"
            >
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Header — mobile */}
      <div className="card-header-mobile" style={{ display: 'none', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 300, color: 'var(--mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.2em', minWidth: 0 }}>{brand}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {catLabel && (
              <span style={{
                fontSize: 10, fontWeight: 300, padding: '1px 6px', borderRadius: 6,
                background: 'transparent', color: 'var(--mid)',
                border: '0.5px solid var(--mid)',
                flexShrink: 0, letterSpacing: '0.08em',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.6, textAlign: 'center',
              }}>
                {catLabel}
              </span>
            )}
            {catLabel && <span style={{ width: 2 }} />}
            {/* Save button */}
            <svg
              onClick={e => { e.stopPropagation(); onToggleSave?.(id) }}
              width="16" height="16" viewBox="0 0 24 24"
              style={{ cursor: 'pointer', transition: 'color 120ms ease', color: saved ? 'var(--rose)' : 'var(--ghost)', flexShrink: 0 }}
              title={saved ? 'Unsave' : 'Save'}
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {/* Dismiss button */}
            {confirmDelete ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <span
                  onClick={handleDismiss}
                  style={{
                    cursor: 'pointer', padding: '2px 8px', borderRadius: 6,
                    background: 'var(--rose)', color: 'var(--color-on-accent)', fontWeight: 600,
                  }}
                >
                  Delete
                </span>
                <span
                  onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
                  style={{
                    cursor: 'pointer', padding: '2px 8px', borderRadius: 6,
                    background: 'var(--color-surface-active)', color: 'var(--mid)',
                    border: '1px solid var(--border2)', fontWeight: 500,
                  }}
                >
                  Cancel
                </span>
              </span>
            ) : (
              <svg
                onClick={handleDismiss}
                width="16" height="16" viewBox="0 0 24 24"
                style={{ cursor: 'pointer', transition: 'color 120ms ease', color: 'var(--ghost)', flexShrink: 0 }}
                title="Remove campaign"
              >
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </div>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{formatDate(published_at)}</span>
      </div>

      {/* Auto-translated badge */}
      {isTranslated && (
        <button
          onClick={e => { e.stopPropagation(); setShowOriginal(v => !v) }}
          style={{
            background: 'var(--color-surface-active)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 500,
            color: 'var(--mid)', cursor: 'pointer', marginBottom: 8,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          {flag} {showOriginal ? 'Show translation' : 'Auto-translated \u00B7 Show original'}
        </button>
      )}

      {/* Title */}
      <div style={{
        fontSize: 18,
        fontWeight: 600,
        fontFamily: titleIsCJK ? `${cjkTitleFont}, serif` : "'DM Serif Display', serif",
        color: 'var(--ink)',
        lineHeight: 1.45,
        letterSpacing: titleIsCJK ? cjkSpacing : '0.03em',
        marginBottom: 8,
      }}>
        {titleIsCJK ? <MixedText text={displayTitle} cjkSpacing={cjkSpacing} latinSpacing="0.03em" /> : displayTitle}
      </div>

      {/* Executive Summary */}
      <div style={{
        fontSize: 13,
        fontFamily: summaryIsCJK ? `${cjkFont}, sans-serif` : undefined,
        color: 'var(--mid)',
        lineHeight: 1.65,
        letterSpacing: summaryIsCJK ? cjkSpacing : 0,
        marginBottom: 12,
      }}>
        {summaryIsCJK ? <MixedText text={displaySummary} cjkSpacing={cjkSpacing} latinSpacing="0" /> : displaySummary}
      </div>


      {/* Strategic Breakdown Toggler */}
      {hasBreakdown && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--rose)', fontWeight: 300,
              padding: '4px 0', fontFamily: 'var(--f)',
              display: 'flex', alignItems: 'center', gap: 4,
              textTransform: 'uppercase', letterSpacing: '0.2em',
            }}
          >
            {breakdownLabel} <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 2, transition: 'transform 200ms ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}><polyline points="2,4 6,8 10,4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          {expanded && (
            <div style={{
              background: 'var(--color-surface-active)',
              borderRadius: 12, padding: '12px 14px',
              marginTop: 8, fontSize: 13,
              lineHeight: 1.75, color: 'var(--mid)',
              fontFamily: hasBreakdownCJK ? `${cjkFont}, sans-serif` : undefined,
              letterSpacing: hasBreakdownCJK ? cjkSpacing : 0,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {effectiveContentType === 'brand_campaign' && <>
                {brand_proposition && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Brand Proposition</strong> — <MixedText text={brand_proposition} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
                {key_message && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Key Message</strong> — <MixedText text={key_message} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
                {target_audience && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Target Audience</strong> — <MixedText text={target_audience} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
                {consumer_insight && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Consumer Insight</strong> — <MixedText text={consumer_insight} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
                {call_to_action && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Call to Action</strong> — <MixedText text={call_to_action} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
              </>}
              {effectiveContentType === 'industry_news' && <>
                {key_takeaway && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Key Takeaway</strong> — <MixedText text={key_takeaway} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
                {strategic_implication && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Strategic Implication</strong> — <MixedText text={strategic_implication} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
              </>}
              {effectiveContentType === 'tactical_format' && <>
                {the_hook && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>The Hook</strong> — <MixedText text={the_hook} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
                {engagement_tactic && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Engagement Tactic</strong> — <MixedText text={engagement_tactic} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
                {conversion_path && (
                  <div><strong style={{ color: 'var(--ink)', letterSpacing: 0, fontWeight: 600, fontFamily: "var(--f)" }}>Conversion Path</strong> — <MixedText text={conversion_path} cjkSpacing={cjkSpacing} latinSpacing="0" /></div>
                )}
              </>}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {allTags.map(tag => <Tag key={tag} label={tag} />)}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid var(--border2)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--rose)', fontWeight: 500, minWidth: 0, marginRight: 8 }}>
          {source_name} →
        </span>
        <span style={{
          fontSize: 12, color: 'var(--ghost)',
          padding: '3px 10px', border: '1px solid var(--border2)',
          borderRadius: 9999, background: 'var(--color-surface)',
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          AI summary
        </span>
      </div>
    </div>
  )
}
