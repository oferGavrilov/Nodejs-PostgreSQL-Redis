import { createClient } from "redis";

const redisUrl = "redis://localhost:6379";

const redisClient = createClient({
    url: redisUrl,
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis client connected successfully!')
        redisClient.set('try', 'Welcome to Express and Typescript with Prisma')
    } catch (error) {
        console.log('Error connecting to Redis: ', error)
        setTimeout(connectRedis, 5000)
    }
}

connectRedis();

export default redisClient;