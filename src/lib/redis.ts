import { createClient } from 'redis'

const redisClient = createClient({
    socket: {
        host: "localhost",
        port: 6379
    }
})

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect()
            console.log('Redis client connected')
        } catch (err) {
            console.error('Redis connection error:', err)
        }
    }
}

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
    console.log('Redis connected successfully')
})

redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting')
})

export { connectRedis, redisClient }
