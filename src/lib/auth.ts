import { v4 as uuidv4 } from 'uuid'
import { connectRedis, redisClient } from '@/lib/redis'

const API_KEY_PREFIX = 'sk-'
const USER_KEY_PREFIX = 'user-id-'
const DEFAULT_KEY_EXPIRY = 30 * 24 * 60 * 60

async function ensureRedisConnection() {
    if (!redisClient.isOpen) {
        await connectRedis()
    }
}

export async function generateApiKey(userId: number): Promise<string> {
    await ensureRedisConnection()
    const apiKey = uuidv4()
    const key = `${API_KEY_PREFIX}${apiKey}`
    const userKey = `${USER_KEY_PREFIX}${userId.toString()}`
    try {
        await redisClient.set(key, userId.toString(), {
            EX: DEFAULT_KEY_EXPIRY
        })
        await redisClient.set(userKey, key, {
            EX: DEFAULT_KEY_EXPIRY
        })
        return key
    } catch (error) {
        console.error('Error generating API key:', error)
        throw new Error('Failed to generate API key')
    }
}

export async function validateApiKey(apiKey: string): Promise<number | null> {
    await ensureRedisConnection()
    const key = `${API_KEY_PREFIX}${apiKey}`
    try {
        const userId = await redisClient.get(key)
        if (!userId) return null
        await redisClient.expire(key, DEFAULT_KEY_EXPIRY)
        return parseInt(userId)
    } catch (error) {
        console.error('Error validating API key:', error)
        return null
    }
}

export async function revokeApiKey(apiKey: string): Promise<boolean> {
    await ensureRedisConnection()
    const key = `${API_KEY_PREFIX}${apiKey}`
    try {
        const userId = await redisClient.get(key)
        if (!userId) return false
        const userKey = `${USER_KEY_PREFIX}${userId.toString()}`
        await redisClient.del(userKey)
        const result = await redisClient.del(key)
        return result === 1
    } catch (error) {
        console.error('Error revoking API key:', error)
        return false
    }
}

export async function getApiKeyByUserId(userId: number): Promise<string | null> {
    await ensureRedisConnection()
    const userKey = `${USER_KEY_PREFIX}${userId}`
    try {
        const apiKey = await redisClient.get(userKey)
        return apiKey
    } catch (error) {
        console.error('Error fetching API key by user ID:', error)
        return null
    }
}
