# ChatLedger (Advance Chat DApp 3)

This repository contains a Next.js + Wagmi chat dApp that stores chat metadata on-chain and media on IPFS.

Quick notes before pushing:

- Do NOT commit any `.env` files containing secrets. This repo now includes `.gitignore` rules for `.env` and `.env.local`.
- Rotate any Pinata/API keys that were accidentally committed and revoke exposed tokens.

Local dev (Windows PowerShell):

```powershell
# install
npm install

# run dev
npm run dev
```

How to push to GitHub (recommended):

1. Create a new repository on GitHub named `ChatLedger` (or use GitHub CLI below).
2. Make sure you have removed secrets from the working tree and git history (see instructions below).
3. Add remote and push:

```powershell
# if creating repo on GitHub web first:
git remote add origin git@github.com:<your-username>/ChatLedger.git
git push -u origin master

# OR using GitHub CLI (if authenticated):
gh repo create ChatLedger --public --source=. --remote=origin --push
```

If you need help scrubbing secrets from history or automating the push, see the notes below or ask me to run the exact commands (you must have appropriate auth configured locally).
