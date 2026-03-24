import { useState } from 'react'
import { requestNotificationPermission } from '../lib/firebase'

/**
 * iOS Safari requires notification permission to be requested from a direct
 * user gesture (tap / click).  This banner appears when permission has not
 * yet been granted and disappears once the user acts on it.
 */
export default function NotificationPrompt() {
  const [state, setState] = useState('idle')   // idle | requesting | granted | denied | unsupported | token
  const [token, setToken] = useState(null)

  // Hide if already granted or explicitly dismissed, or not supported
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && state === 'idle') return null
  if (typeof Notification === 'undefined') return null
  if (Notification.permission === 'denied' && state === 'idle') return null
  if (state === 'dismissed') return null

  const handleEnable = async () => {
    setState('requesting')
    try {
      const fcmToken = await requestNotificationPermission()
      if (fcmToken) {
        setToken(fcmToken)
        setState('token')
      } else if (Notification.permission === 'denied') {
        setState('denied')
      } else {
        setState('denied')
      }
    } catch {
      setState('denied')
    }
  }

  const bannerStyle = {
    margin: '10px 16px',
    padding: '14px 18px',
    borderRadius: 14,
    background: 'var(--card, #fff)',
    border: '1px solid var(--border, #e5e0db)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    fontSize: 13,
    lineHeight: 1.5,
  }

  const btnStyle = {
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    background: 'var(--rose, #c46b6b)',
    color: '#fff',
  }

  // Show token for mobile debugging (tap to copy)
  if (state === 'token' && token) {
    return (
      <div style={bannerStyle}>
        <span style={{ fontWeight: 600 }}>Notifications enabled</span>
        <span style={{ fontSize: 11, color: 'var(--ghost)', wordBreak: 'break-all', userSelect: 'all' }}>
          FCM token (tap to copy):<br />{token}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{ ...btnStyle, background: 'var(--ghost)', fontSize: 11 }}
            onClick={() => {
              navigator.clipboard?.writeText(token).then(
                () => alert('Token copied!'),
                () => { /* clipboard not available, user can long-press select */ }
              )
            }}
          >
            Copy Token
          </button>
          <button
            style={{ ...btnStyle, background: 'transparent', color: 'var(--ghost)', fontSize: 11 }}
            onClick={() => setState('dismissed')}
          >
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div style={bannerStyle}>
        <span>Notification permission was denied. To enable, go to your browser/device settings.</span>
        <button style={{ ...btnStyle, background: 'transparent', color: 'var(--ghost)' }}
          onClick={() => setState('dismissed')}>
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div style={bannerStyle}>
      <span>Enable push notifications to get alerted when new campaigns are found.</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle} onClick={handleEnable} disabled={state === 'requesting'}>
          {state === 'requesting' ? 'Requesting…' : 'Enable Notifications'}
        </button>
        <button
          style={{ ...btnStyle, background: 'transparent', color: 'var(--ghost)' }}
          onClick={() => setState('dismissed')}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
