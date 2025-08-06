import { createClient } from "redis";

//--------------------- local ------------------
// export const redisClient = createClient({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
// });

// redisClient.on("error", (err) =>
//   console.error("Redis Client Error:", err)
// );

// export const connectRedis = async () => {
//   if (!redisClient.isOpen) {
//     await redisClient.connect();
//     console.log("Redis connected");
//   }
// };

//-------------------host------------
import { Redis } from "@upstash/redis";

export const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});