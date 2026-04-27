import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON')

  const parsed = JSON.parse(raw)
  if (!parsed?.project_id || !parsed?.client_email || !parsed?.private_key) {
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON')
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  }
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) return getApp()
  const account = readServiceAccount()
  return initializeApp({
    credential: cert(account),
  })
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp())
}

