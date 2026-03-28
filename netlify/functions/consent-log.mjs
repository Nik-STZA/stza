import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { consent, url, timestamp } = body;
  if (!consent || !['all', 'essentials'].includes(consent)) {
    return new Response('Invalid consent value', { status: 400 });
  }

  const store = getStore('consent-audit-log');

  const entry = {
    consent,
    url: url || '',
    timestamp: timestamp || new Date().toISOString(),
    ip: context.ip || 'unknown',
    country: context.geo?.country?.code || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown'
  };

  const key = `${entry.timestamp}_${context.requestId || crypto.randomUUID()}`;

  await store.setJSON(key, entry);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = {
  path: '/.netlify/functions/consent-log',
  method: 'POST'
};
