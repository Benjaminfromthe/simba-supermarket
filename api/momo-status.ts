/**
 * Vercel Serverless Function — Check MoMo payment status
 * GET /api/momo-status?referenceId=xxx
 *
 * Returns: { status: "PENDING" | "SUCCESSFUL" | "FAILED" }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = process.env.MOMO_ENVIRONMENT === 'production'
  ? 'https://proxy.momoapi.mtn.com'
  : 'https://sandbox.momodeveloper.mtn.com';

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`
  ).toString('base64');
  const res = await fetch(`${BASE_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY || '',
    },
  });
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { referenceId } = req.query;
  if (!referenceId) return res.status(400).json({ error: 'Missing referenceId' });

  // If no API keys, return mock SUCCESSFUL after 3s (handled client-side)
  if (!process.env.MOMO_SUBSCRIPTION_KEY) {
    return res.status(200).json({ status: 'SUCCESSFUL', mock: true });
  }

  try {
    const token = await getAccessToken();
    const statusRes = await fetch(
      `${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Target-Environment': process.env.MOMO_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY || '',
        },
      }
    );
    const data = await statusRes.json();
    return res.status(200).json({ status: data.status, mock: false });
  } catch (err: any) {
    return res.status(200).json({ status: 'SUCCESSFUL', mock: true, error: err.message });
  }
}
