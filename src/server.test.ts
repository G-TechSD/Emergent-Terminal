import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

// Test utilities - mirror the server's token management
const TEST_STORAGE_DIR = path.join(process.cwd(), '.test-storage')
const TEST_TOKEN_FILE = path.join(TEST_STORAGE_DIR, 'test-token.json')

interface TokenData {
  token: string
  createdAt: string
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function loadOrCreateToken(tokenFile: string, storageDir: string): string {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }
  
  try {
    if (fs.existsSync(tokenFile)) {
      const data = JSON.parse(fs.readFileSync(tokenFile, 'utf-8')) as TokenData
      return data.token
    }
  } catch (_err) {
    // Error loading, will generate new
  }

  const token = generateToken()
  const data: TokenData = {
    token,
    createdAt: new Date().toISOString(),
  }
  fs.writeFileSync(tokenFile, JSON.stringify(data, null, 2))
  return token
}

describe('Token Management', () => {
  beforeEach(() => {
    // Clean up test storage
    if (fs.existsSync(TEST_STORAGE_DIR)) {
      fs.rmSync(TEST_STORAGE_DIR, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up
    if (fs.existsSync(TEST_STORAGE_DIR)) {
      fs.rmSync(TEST_STORAGE_DIR, { recursive: true })
    }
  })

  it('should generate a 64-character hex token', () => {
    const token = generateToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should create storage directory if it does not exist', () => {
    expect(fs.existsSync(TEST_STORAGE_DIR)).toBe(false)
    loadOrCreateToken(TEST_TOKEN_FILE, TEST_STORAGE_DIR)
    expect(fs.existsSync(TEST_STORAGE_DIR)).toBe(true)
  })

  it('should create a new token file if none exists', () => {
    expect(fs.existsSync(TEST_TOKEN_FILE)).toBe(false)
    const token = loadOrCreateToken(TEST_TOKEN_FILE, TEST_STORAGE_DIR)
    expect(fs.existsSync(TEST_TOKEN_FILE)).toBe(true)
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should return the same token on subsequent calls', () => {
    const token1 = loadOrCreateToken(TEST_TOKEN_FILE, TEST_STORAGE_DIR)
    const token2 = loadOrCreateToken(TEST_TOKEN_FILE, TEST_STORAGE_DIR)
    expect(token1).toBe(token2)
  })

  it('should store token with createdAt timestamp', () => {
    loadOrCreateToken(TEST_TOKEN_FILE, TEST_STORAGE_DIR)
    const data = JSON.parse(fs.readFileSync(TEST_TOKEN_FILE, 'utf-8'))
    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('createdAt')
    expect(new Date(data.createdAt)).toBeInstanceOf(Date)
  })

  it('should handle corrupted token file gracefully', () => {
    fs.mkdirSync(TEST_STORAGE_DIR, { recursive: true })
    fs.writeFileSync(TEST_TOKEN_FILE, 'invalid json')
    
    // Should not throw, should generate new token
    const token = loadOrCreateToken(TEST_TOKEN_FILE, TEST_STORAGE_DIR)
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe('Session Buffer', () => {
  it('should maintain a circular buffer of output', () => {
    const MAX_BUFFER_SIZE = 100 * 1024 // 100KB
    const buffer: string[] = []
    let bufferSize = 0

    function addToBuffer(data: string) {
      buffer.push(data)
      bufferSize += data.length
      
      // Trim from front if too large
      while (bufferSize > MAX_BUFFER_SIZE && buffer.length > 0) {
        const removed = buffer.shift()!
        bufferSize -= removed.length
      }
    }

    // Add data
    for (let i = 0; i < 1000; i++) {
      addToBuffer('x'.repeat(200))
    }

    expect(bufferSize).toBeLessThanOrEqual(MAX_BUFFER_SIZE)
  })
})

describe('URL Token Validation', () => {
  const validToken = 'a'.repeat(64)

  function validateToken(providedToken: string, storedToken: string): boolean {
    if (!providedToken || providedToken.length !== 64) {
      return false
    }
    return providedToken === storedToken
  }

  it('should accept valid token', () => {
    expect(validateToken(validToken, validToken)).toBe(true)
  })

  it('should reject empty token', () => {
    expect(validateToken('', validToken)).toBe(false)
  })

  it('should reject wrong token', () => {
    expect(validateToken('b'.repeat(64), validToken)).toBe(false)
  })

  it('should reject short token', () => {
    expect(validateToken('short', validToken)).toBe(false)
  })

  it('should reject null/undefined', () => {
    expect(validateToken(null as any, validToken)).toBe(false)
    expect(validateToken(undefined as any, validToken)).toBe(false)
  })
})
