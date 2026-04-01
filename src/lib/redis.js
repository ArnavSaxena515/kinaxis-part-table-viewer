import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export const REDIS_KEYS = {
  STATUS: 'kinaxis:status',
  DATA: 'kinaxis:data',
};

export const TTL_SECONDS = 3600; // 1 hour
