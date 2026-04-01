import { NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '../../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Read "kinaxis:status" from Redis
    const status = await redis.get(REDIS_KEYS.STATUS);

    if (status === 'COMPLETED') {
      const dataStr = await redis.get(REDIS_KEYS.DATA);
      let records = [];
      try {
        if (typeof dataStr === 'string') {
          records = JSON.parse(dataStr);
        } else if (dataStr) {
          records = dataStr;
        }
      } catch(e) { /* ignore parse err */ }

      return NextResponse.json({
        status: 'COMPLETED',
        data: records,
        count: Array.isArray(records) ? records.length : 0,
      });
    }

    if (status === 'RUNNING') {
      return NextResponse.json({ status: 'RUNNING', data: null });
    }

    if (status === 'ERRORED') {
      return NextResponse.json({ status: 'ERRORED', data: null });
    }

    // Default: IDLE
    return NextResponse.json({ status: 'IDLE', data: null });
  } catch (error) {
    console.error('Data check error:', error);
    return NextResponse.json(
      { status: 'ERROR', message: 'Unable to check status' },
      { status: 500 }
    );
  }
}
