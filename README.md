# ChatLedger (Advance Chat DApp 3)

This repository contains a Next.js + Wagmi chat dApp that stores chat metadata on-chain and media on IPFS.

Quick notes before deploying:

- Do NOT commit any `.env` files containing secrets. This repo now includes `.gitignore` rules for `.env` and `.env.local`.
- Rotate any Pinata/API keys that were accidentally committed and revoke exposed tokens.

Local dev (Windows PowerShell):

```powershell
# install
npm install

# run dev
npm run dev
```

## Deploying on Vercel

This project uses static export. We build with Next and serve the `out` directory.

Vercel settings (Dashboard):

- Git Repository: github.com/sachinkardam00/ChatLedger
- Production Branch: `main`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `out`
- Node.js Version: 18.x

Environment Variables (Project Settings → Environment Variables):

Copy from `.env.example` and create these (Production + Preview):

- `NEXT_PUBLIC_PLATFORM_NAME`
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_CHAIN_NAME`
- `NEXT_PUBLIC_CHAIN_SYMBOL`
- `NEXT_PUBLIC_NETWORK`
- `NEXT_PUBLIC_BLOCK_EXPLORER_NAME`
- `NEXT_PUBLIC_BLOCK_EXPLORER`

Then trigger a Deploy on the Vercel dashboard.

### CLI deploy (optional)

```powershell
# one-time: login and link the project
npm i -g vercel
vercel login
vercel link --project ChatLedger

# build and deploy using the static output (no serverless)
npm run build
vercel deploy --prebuilt --prod
```

The `vercel.json` in the repo already points Vercel to serve the `out` folder.
