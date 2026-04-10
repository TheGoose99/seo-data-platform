import crypto from 'node:crypto'

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENC_KEY_BASE64
  if (!raw) throw new Error('Missing TOKEN_ENC_KEY_BASE64')

  const key = Buffer.from(raw, 'base64')
  if (key.length < 32) throw new Error('TOKEN_ENC_KEY_BASE64 must decode to at least 32 bytes')
  return key.subarray(0, 32)
}

type EncryptedPayload = {
  v: 1
  alg: 'aes-256-gcm'
  iv: string
  tag: string
  data: string
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  const payload: EncryptedPayload = {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: data.toString('base64'),
  }

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
}

export function decryptToken(ciphertextB64: string): string {
  const key = getKey()
  const decoded = Buffer.from(ciphertextB64, 'base64').toString('utf8')
  const payload = JSON.parse(decoded) as EncryptedPayload

  if (payload.v !== 1 || payload.alg !== 'aes-256-gcm') throw new Error('Unsupported token payload')

  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')
  const data = Buffer.from(payload.data, 'base64')

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const out = Buffer.concat([decipher.update(data), decipher.final()])
  return out.toString('utf8')
}

