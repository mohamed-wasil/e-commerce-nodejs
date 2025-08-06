import cron from 'node-cron';
import { redisClient } from '../Configs';

cron.schedule('* * * * *', async () => {
    try {
        await redisClient.del('products:all')
        console.log('Redis Cache Cleaned')
    } catch (error) {
        console.error('Error cleaning Redis cache:', error)
    }
})