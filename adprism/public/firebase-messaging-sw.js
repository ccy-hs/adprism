/* eslint-env serviceworker */
/* Placeholders are replaced at build time by deploy.yml */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            '__FIREBASE_API_KEY__',
  projectId:         'ad-prism',
  messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
  appId:             '__FIREBASE_APP_ID__',
})

// Firebase SDK handles background notification display automatically
// when the backend sends a "notification" payload.
firebase.messaging()
