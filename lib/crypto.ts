'server-only'

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SALT_LENGTH = 16
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

function getEncryptionKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // Deriva uma chave de 32 bytes (256 bits) a partir da ENCRYPTION_KEY
  // Usando um salt fixo para garantir consistência
  const salt = Buffer.from(encryptionKey.slice(0, SALT_LENGTH), 'utf8')
  return scryptSync(encryptionKey, salt, KEY_LENGTH)
}

export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Text to encrypt cannot be empty')
  }

  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const tag = cipher.getAuthTag()

  // Retorna: iv + tag + encrypted (tudo em hex)
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Encrypted text cannot be empty')
  }

  const parts = encryptedText.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format')
  }

  const [ivHex, tagHex, encrypted] = parts

  const key = getEncryptionKey()
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
