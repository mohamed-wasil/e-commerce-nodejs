import { createClient } from "redis";

export const redisClient = createClient({
    url: 'redis://127.0.0.1:6379',
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

export const connectRedis = async () => {
    await redisClient.connect()
    console.log('Redis connected')
}