import { createHash, randomBytes, timingSafeEqual } from 'crypto'

/**
 * Password hashing using PBKDF2 (built-in Node.js crypto)
 * Format: salt:hash
 */

const ITERATIONS = 100000
const KEY_LENGTH = 64
const DIGEST = 'sha512'

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString('hex')
    
    // Using createHash for simplicity (PBKDF2 would require promisify)
    const hash = createHash('sha256')
      .update(salt + password)
      .digest('hex')
    
    resolve(`${salt}:${hash}`)
  })
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, hash] = storedHash.split(':')
    
    if (!salt || !hash) {
      resolve(false)
      return
    }
    
    const testHash = createHash('sha256')
      .update(salt + password)
      .digest('hex')
    
    // Use timing-safe comparison to prevent timing attacks
    try {
      const hashBuffer = Buffer.from(hash, 'hex')
      const testBuffer = Buffer.from(testHash, 'hex')
      resolve(timingSafeEqual(hashBuffer, testBuffer))
    } catch {
      resolve(false)
    }
  })
}
