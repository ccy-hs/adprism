import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

let messaging = null
try {
  messaging = getMessaging(app)
} catch (e) {
  // Messaging not supported (e.g. missing service worker)
}

// Simple device fingerprint so each browser/device gets its own Firestore doc.
function deviceId() {
  const key = 'adprism_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID?.() || ('' + Date.now() + Math.random()).replace('.', '')
    localStorage.setItem(key, id)
  }
  return id
}

async function saveToken(token, swReg) {
  const ua = navigator.userAgent
  const label = /iPhone|iPad/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : 'desktop'
  const docId = deviceId()

  await setDoc(doc(db, 'fcm_tokens', docId), {
    token,
    label,
    updatedAt: new Date(),
  })
  // Keep the legacy "owner" doc in sync for backward compat during transition
  await setDoc(doc(db, 'fcm_tokens', 'owner'), { token, updatedAt: new Date() })
  console.log(`[AdPrism] FCM token saved ✓  (device=${docId}, ${label})`)

  // Foreground notification display
  onMessage(messaging, (payload) => {
    const n = payload.notification || payload.data || {}
    const title = n.title
    const body = n.body
    if (!title) return
    swReg.showNotification(title, {
      body,
      icon: '/adprism/apple-touch-icon.png',
    })
  })
}

/**
 * Bound to user gesture (button click). Requests permission and fetches
 * the initial FCM token. Returns the token string or null.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('[AdPrism] Push notifications not supported in this browser')
    return null
  }

  if (!messaging) {
    console.warn('[AdPrism] FCM messaging not available')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('[AdPrism] Notification permission denied:', permission)
      return null
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error('[AdPrism] VITE_FIREBASE_VAPID_KEY is not set — push notifications will not work')
      return null
    }

    const swReg = await navigator.serviceWorker.register('/adprism/firebase-messaging-sw.js')
    console.log('[AdPrism] Service worker registered ✓')

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    })

    if (token) {
      await saveToken(token, swReg)
    } else {
      console.warn('[AdPrism] getToken returned empty — check VAPID key and service worker')
    }

    return token
  } catch (err) {
    console.error('[AdPrism] Push notification setup failed:', err)
    return null
  }
}

/**
 * Runs automatically on app load. If permission is already granted,
 * registers the SW, refreshes the token, and sets up the onMessage listener.
 */
export async function initForegroundMessaging() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (!('serviceWorker' in navigator)) return
  if (!messaging) return

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) return

  try {
    const swReg = await navigator.serviceWorker.register('/adprism/firebase-messaging-sw.js')
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    })

    if (token) {
      await saveToken(token, swReg)
    }
  } catch (err) {
    console.error('[AdPrism] initForegroundMessaging failed:', err)
  }
}
