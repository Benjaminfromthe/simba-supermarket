# Real MTN MoMo Integration Setup

## Step 1 — Register at MTN Developer Portal
1. Go to https://momodeveloper.mtn.co.rw
2. Click "Sign Up" → create account with your business email
3. Subscribe to the **Collections** product
4. You'll receive a **Subscription Key** (Ocp-Apim-Subscription-Key)

## Step 2 — Create API User & Key (Sandbox first)
Run these commands in your terminal (replace YOUR_SUBSCRIPTION_KEY):

```bash
# 1. Generate a UUID for your API user
API_USER=$(uuidgen)  # or use any UUID generator

# 2. Create API user
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser \
  -H "X-Reference-Id: $API_USER" \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY" \
  -H "Content-Type: application/json" \
  -d '{"providerCallbackHost": "https://simba-google-ai.vercel.app"}'

# 3. Create API key for that user
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/$API_USER/apikey \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY"
# → Returns: {"apiKey": "YOUR_API_KEY"}
```

## Step 3 — Add to Vercel Environment Variables
Go to: https://vercel.com → simba-google-ai → Settings → Environment Variables

Add these 5 variables:
```
MOMO_SUBSCRIPTION_KEY = (from Step 1)
MOMO_API_USER         = (UUID from Step 2)
MOMO_API_KEY          = (from Step 2 curl response)
MOMO_ENVIRONMENT      = sandbox   (change to "production" when going live)
MOMO_RECEIVER_NUMBER  = 0794915285
```

## Step 4 — Test
1. Deploy to Vercel (git push)
2. Go to checkout → enter a test phone number
3. Click "Pay 500 RWF Deposit"
4. In sandbox mode: use MTN test number 46733123450 to simulate approval

## Step 5 — Go Live
1. Go back to momodeveloper.mtn.co.rw → Apply for Production
2. MTN reviews your application (1-3 business days)
3. Change MOMO_ENVIRONMENT to "production" in Vercel
4. Real money flows to your MTN account 0794915285

## How it works in the app
- Customer enters phone → clicks Pay
- Your Vercel function calls MTN API → MTN sends USSD to customer's phone
- Customer sees "Pay 500 RWF to Simba Supermarket?" on their phone
- Customer approves → 500 RWF goes to 0794915285
- App polls /api/momo-status every 5s → when SUCCESSFUL → order confirmed
- If API keys not set → falls back to mock flow (existing behavior)
