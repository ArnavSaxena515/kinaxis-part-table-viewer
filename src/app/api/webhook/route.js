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

    let body = null;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      // Malformed JSON expected in some cases from proxy — will use string fallback below
    }
    
    // 1. If body has an "objects" key and it's an array, use that
    // 2. If body itself is an array, use it directly
    // 3. Otherwise find the first array value in the body object
    let records = [];
    if (body && Array.isArray(body.objects)) {
      records = body.objects;
    } else if (Array.isArray(body)) {
      records = body;
    } else if (body && typeof body === 'object') {
      const firstArray = Object.values(body).find(val => Array.isArray(val));
      if (firstArray) {
        records = firstArray;
      }
    }

    // 4. Fallback for malformed JSON using raw text
    if (!records || records.length === 0) {
      const startIndex = bodyText.indexOf('[');
      const endIndex = bodyText.lastIndexOf(']');

      if (startIndex !== -1 && endIndex !== -1) {
        const arrayStr = bodyText.substring(startIndex, endIndex + 1);
        try {
          const parsedArray = JSON.parse(arrayStr);
          if (Array.isArray(parsedArray)) {
            records = parsedArray;
          }
        } catch (e) {
          // Both approaches failed
        }
      }
    }

    if (!records || records.length === 0) {
      throw new Error('No records found');
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
