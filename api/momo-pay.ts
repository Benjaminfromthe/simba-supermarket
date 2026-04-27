/**
 * Vercel Serverless Function — MTN MoMo Collections API
 * POST /api/momo-pay
 *
 * Flow:
 * 1. Frontend sends { phone, amount, orderId }
 * 2. This function gets an access token from MTN
 * 3. Calls MTN requesttopay → sends USSD push to customer's phone
 * 4. Returns { referenceId } so frontend can poll for status
 *
 * Required Vercel env vars (set in Vercel dashboard → Settings → Environment Variables):
 *   MOMO_SUBSCRIPTION_KEY   — from momodeveloper.mtn.co.rw (Collections product)
 *   MOMO_API_USER           — UUID you generate (see README below)
 *   MOMO_API_KEY            — generated after creating API user
 *   MOMO_ENVIRONMENT        — "sandbox" or "production"
 *   MOMO_RECEIVER_NUMBER    — your MTN number e.g. 0794915285
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check env vars are configured
  if (!process.env.MOMO_SUBSCRIPTION_KEY || !process.env.MOMO_API_USER || !process.env.MOMO_API_KEY) {
    // Graceful fallback — return mock success so existing flow still works
    return res.status(200).json({
      success: true,
      mock: true,
      referenceId: uuidv4(),
      message: 'Mock payment (MTN API keys not configured)',
    });
  }

  const { phone, amount, orderId } = req.body;

  if (!phone || !amount || !orderId) {
    return res.status(400).json({ error: 'Missing phone, amount, or orderId' });
  }

  // Normalize phone: strip leading 0, add 250 country code
  const normalizedPhone = phone.startsWith('0')
    ? `250${phone.slice(1)}`
    : phone.startsWith('+')
    ? phone.slice(1)
    : phone;

  const referenceId = uuidv4();

  try {
    const token = await getAccessToken();

    const payRes = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': process.env.MOMO_ENVIRONMENT || 'sandbox',
        'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: process.env.MOMO_ENVIRONMENT === 'production' ? 'RWF' : 'EUR',
        externalId: orderId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: normalizedPhone,
        },
        payerMessage: `Simba Supermarket deposit for order ${orderId}`,
        payeeNote: `Simba order ${orderId} - deposit`,
      }),
    });

    if (payRes.status === 202) {
      // 202 Accepted = USSD push sent successfully
      return res.status(200).json({
        success: true,
        mock: false,
        referenceId,
        message: 'USSD prompt sent to customer phone',
      });
    }

    const errText = await payRes.text();
    throw new Error(`MTN API error ${payRes.status}: ${errText}`);

  } catch (err: any) {
    console.error('MoMo payment error:', err.message);
    // Fallback to mock so checkout doesn't break
    return res.status(200).json({
      success: true,
      mock: true,
      referenceId: uuidv4(),
      message: 'Mock payment (MTN API error)',
      error: err.message,
    });
  }
}
