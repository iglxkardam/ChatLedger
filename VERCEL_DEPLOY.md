VERCEL DEPLOY GUIDE

This file explains how to deploy this Next.js project to Vercel (PowerShell commands included).

Summary

- This project uses Next.js but is configured to export a static site (see `next.config.js` and `package.json` - `npm run build` runs `next build && next export`).
- The static export output directory is `out`. `vercel.json` is configured to use `@vercel/static-build` and set `distDir` to `out`.

Required environment variables (frontend - client-exposed)
These environment variables are referenced by the app. Set them in Vercel under Project > Settings > Environment Variables or via the Vercel CLI.

- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
- NEXT_PUBLIC_RPC_URL
- NEXT_PUBLIC_CHAIN_ID
- NEXT_PUBLIC_CHAIN_NAME
- NEXT_PUBLIC_CHAIN_SYMBOL
- NEXT_PUBLIC_BLOCK_EXPLORER
- NEXT_PUBLIC_BLOCK_EXPLORER_NAME
- NEXT_PUBLIC_NETWORK
- NEXT_PUBLIC_CONTRACT_ADDRESS
- NEXT_PUBLIC_PINATA_API_KEY
- NEXT_PUBLIC_PINATA_SECRET_API_KEY
- NEXT_PUBLIC_PINATA_JWT
- NEXT_PUBLIC_PLATFORM_NAME

Notes about sensitive values

- Variables named NEXT*PUBLIC*_ are injected into client-side bundles and therefore are visible to users. Do NOT store private keys or secrets that must remain private in NEXT*PUBLIC*_ variables.
- The web3/hardhat tooling (in `web3/`) may require `NETWORK_RPC_URL` and `PRIVATE_KEY` for contract deployment; those should never be exposed in the frontend. Keep them only in CI or local dev environments.

Recommended Vercel project settings

- Framework Preset: Next.js
- Build Command: npm run build
- Output Directory: out
- Install Command: npm install
- Node Version: 18 (Vercel default works; ensure >=18)

PowerShell (Windows) quick steps - Git integration (recommended)

1. Push your repo to GitHub (or Git provider) and connect it in the Vercel Dashboard.
2. In Vercel, import the repository and choose the Project settings above.
3. Add the environment variables (make sure to set values for Production and Preview as needed).
4. Trigger a deploy by pushing to the connected branch (e.g., `master` or `main`).

PowerShell CLI steps (manual/developer flow)

# Install Vercel CLI if you don't have it

npm i -g vercel

# Login (will open browser for authentication)

vercel login

# From the repo root (run these in PowerShell)

cd "e:\\solidity\\Advance Chat DApp 3"

# Link or create a new Vercel project interactively

vercel --prod

# Alternatively, add environment variables from PowerShell using the CLI (example templates)

# Replace <VALUE> with the actual value. Repeat for each variable and pick the environment (production/preview/development)

vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID production <VALUE>
vercel env add NEXT_PUBLIC_RPC_URL production <VALUE>
vercel env add NEXT_PUBLIC_CHAIN_ID production <VALUE>
vercel env add NEXT_PUBLIC_CHAIN_NAME production <VALUE>
vercel env add NEXT_PUBLIC_CHAIN_SYMBOL production <VALUE>
vercel env add NEXT_PUBLIC_BLOCK_EXPLORER production <VALUE>
vercel env add NEXT_PUBLIC_BLOCK_EXPLORER_NAME production <VALUE>
vercel env add NEXT_PUBLIC_NETWORK production <VALUE>
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production <VALUE>
vercel env add NEXT_PUBLIC_PINATA_API_KEY production <VALUE>
vercel env add NEXT_PUBLIC_PINATA_SECRET_API_KEY production <VALUE>
vercel env add NEXT_PUBLIC_PINATA_JWT production <VALUE>
vercel env add NEXT_PUBLIC_PLATFORM_NAME production <VALUE>

# Deploy with the CLI once configured

vercel --confirm --prod

Troubleshooting notes

- If you see Next.js server-only APIs or unsupported modules during build, verify the app truly exports statically. This repo sets `next.config.js.output` to `export` and `package.json` runs `next export` on build, so it's expected to be a static export.
- If you need SSR/Serverless functions (API routes, dynamic server-side rendering), remove `next export` from the build script and let Vercel use `@vercel/next` default build. Then remove `vercel.json` or update it to let Vercel run `next` normally.
- For image optimization features that depend on the Next.js image optimizer, note that `next export` disables built-in image optimisation; `next.config.js` already sets `images.unoptimized = true`.

Optional automation (CI)

- Add a GitHub Action to run tests and then call `vercel --prod` from a safe runner with VERCEL_TOKEN stored as a secret.

That's it — if you'd like, I can:

- Add a sample GitHub Actions workflow to deploy on push to `master`.
- Convert the `build` script to serverful Next.js build (if you want SSR/API routes on Vercel) and update `vercel.json` accordingly.

-- Secret handling & safety checklist --

1. Never commit private keys or real secrets

- Ensure `.env`, `web3/.env`, and any files containing `PRIVATE_KEY`, `NETWORK_RPC_URL`, `API_KEY` or similar are listed in `.gitignore` and `.vercelignore` (this repo was updated to include common patterns).

2. If you've already accidentally committed secrets

- Remove the file from git history immediately (recommended minimal steps):
  - Use the BFG or git filter-repo to scrub the secret file from history. Example (local machine):
    - Install and run `bfg` or `git filter-repo` and follow their docs. After cleaning, force-push the cleaned branch to your remote.
- Rotate the exposed credentials (PRIVATE_KEY, API keys, tokens) immediately — treat them as compromised.

3. Use Vercel environment variables / secrets instead of committing

- Set production values in Vercel Dashboard or use `vercel env add` to add them from the CLI. Never place secret values in files tracked by Git.

4. For CI deployments

- Store secrets (VERCEL_TOKEN, RPC private keys for deployment scripts, etc.) in your Git provider's Actions secrets and reference them from the workflow. Do not echo secrets into logs.

If you want, I can add a short GitHub Action that will build and deploy to Vercel using a `VERCEL_TOKEN` stored as a GitHub secret and will not expose any sensitive values in logs.
