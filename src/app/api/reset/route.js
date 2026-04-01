import { NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '../../../lib/redis';

export async function POST() {
  try {
    await redis.del(REDIS_KEYS.STATUS, REDIS_KEYS.DATA);
    return NextResponse.json({ reset: true });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset state' }, { status: 500 });
  }
}
