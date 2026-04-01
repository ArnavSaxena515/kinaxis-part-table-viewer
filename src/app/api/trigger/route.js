import { NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '../../../lib/redis';

// Note: In production these should be loaded from actual process.env, 
// using the provided constants if they are not set.
const REFOLD_WORKFLOW_ID = process.env.REFOLD_WORKFLOW_ID || '69cb8e2cdd1d9c12a6e03b99';
const REFOLD_API_KEY = process.env.REFOLD_API_KEY || 'tk42aa441c-7f2a-4f76-a08f-3a1f99fc4df0';
const REFOLD_LINKED_ACCOUNT_ID = process.env.REFOLD_LINKED_ACCOUNT_ID || 'cobalt_test_user';
const REFOLD_WORKFLOW_SLUG = process.env.REFOLD_WORKFLOW_SLUG || 'Coba-6128';

export async function POST() {
  try {
    const sessionId = Date.now().toString();

    // Clear Redis
    await redis.del(REDIS_KEYS.STATUS, REDIS_KEYS.DATA);

    // Set Redis key "kinaxis:status" to "RUNNING"
    await redis.set(REDIS_KEYS.STATUS, 'RUNNING');

    // Call Refold API
    const response = await fetch(`https://sapis.gocobalt.io/api/v1/workflow/${REFOLD_WORKFLOW_ID}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': REFOLD_API_KEY,
        'linked_account_id': REFOLD_LINKED_ACCOUNT_ID,
        'slug': REFOLD_WORKFLOW_SLUG,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Refold API failed with status ${response.status}`);
    }

    return NextResponse.json({ session_id: sessionId, status: 'RUNNING' });
  } catch (error) {
    console.error('Trigger error:', error);
    await redis.set(REDIS_KEYS.STATUS, 'ERRORED');
    return NextResponse.json({ error: 'Failed to trigger workflow' }, { status: 500 });
  }
}
