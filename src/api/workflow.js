import { TRIGGER_URL, TRIGGER_HEADERS, POLL_URL, COMMON_HEADERS } from './constants';

/**
 * Trigger the harmonization workflow.
 * Returns { execution_id: string }
 */
export async function triggerWorkflow() {
  const response = await fetch(TRIGGER_URL, {
    method: 'POST',
    headers: TRIGGER_HEADERS,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Trigger failed (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Poll for execution results with retry logic.
 * @param {string} executionId
 * @param {AbortSignal} signal
 * @returns {Promise<object>} The poll response JSON
 */
export async function pollExecution(executionId, signal) {
  let retries = 0;
  const maxRetries = 3;
  const retryDelay = 2000;

  while (retries < maxRetries) {
    try {
      const response = await fetch(POLL_URL(executionId), {
        method: 'GET',
        headers: COMMON_HEADERS,
        signal,
      });

      if (!response.ok) {
        throw new Error(`Poll failed (${response.status})`);
      }

      return response.json();
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      retries++;
      if (retries >= maxRetries) {
        throw new Error('NETWORK_ERROR');
      }
      await new Promise((r) => setTimeout(r, retryDelay));
    }
  }
}
