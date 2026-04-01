import { NextResponse } from 'next/server';
import { redis, REDIS_KEYS, TTL_SECONDS } from '../../../lib/redis';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(request) {
  try {
    const bodyText = await request.text();
    if (!bodyText) {
      throw new Error('Empty body');
    }

    const body = JSON.parse(bodyText);
    
    // The body will be the array of harmonized records directly: [ { Name: "85", ... }, ... ]
    // OR it may be wrapped: { "data": [ ... ] } — handle both cases
    let records = [];
    if (Array.isArray(body)) {
      records = body;
    } else if (body && Array.isArray(body.data)) {
      records = body.data;
    } else {
      throw new Error('Invalid data format received');
    }

    // Store in Redis
    await redis.set(REDIS_KEYS.DATA, JSON.stringify(records), { ex: TTL_SECONDS });
    await redis.set(REDIS_KEYS.STATUS, 'COMPLETED', { ex: TTL_SECONDS });

    return NextResponse.json(
      { received: true, count: records.length },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Attempt to set ERRORED status on failure
    try {
      await redis.set(REDIS_KEYS.STATUS, 'ERRORED', { ex: TTL_SECONDS });
    } catch (e) {
      console.error('Failed to update Redis error status', e);
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
