# mathresolver

AI-powered math tutor. Upload a problem as **image, PDF, or text**, pick a
**country curriculum**, and get back a **step-by-step solution** where Claude
explains the reasoning between every two consecutive steps — not just the
final answer.

## Stack

- **Frontend:** React + Vite + TypeScript (Firebase Hosting)
- **Backend:** Firebase Cloud Functions v2 (Node 22, TypeScript)
- **Auth:** Firebase Auth
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage
- **AI:** Anthropic Claude (multimodal — images and PDFs sent directly)
- **CI/CD:** GitHub Actions

## Local development

```bash
nvm use           # Node 22
npm ci            # installs root + workspaces (apps/web, functions)
cp apps/web/.env.example apps/web/.env.local   # fill with your Firebase web config

# Start all Firebase emulators (auth, firestore, functions, storage, hosting)
firebase emulators:start

# In another terminal, run the Vite dev server
npm --workspace apps/web run dev
```

### Setting the Anthropic API key (once per environment)

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

The key is never stored in git or GitHub; Cloud Functions pulls it at
runtime via `defineSecret`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server for the web app |
| `npm run build` | Build web + functions |
| `npm run lint` | ESLint across both packages |
| `npm run typecheck` | `tsc --noEmit` across both packages |
| `npm test` | Vitest in both packages |
| `npm run emulators` | Start the Firebase emulator suite |

## CI/CD

- **Every PR** runs `.github/workflows/pr.yml`: install → lint → typecheck → test → build (both packages) plus Firestore/Storage rules tests.
- **Every merge to `main`** runs `.github/workflows/deploy.yml`: the same checks, then deploys **hosting**, **functions**, **firestore rules & indexes**, and **storage rules**.

## Repository layout

```
apps/web/        React + Vite + TS frontend
functions/       Firebase Cloud Functions v2 (TS)
firestore.rules  Firestore security rules
storage.rules    Storage security rules
firebase.json    Firebase project config
.github/         CI/CD workflows
```

See `/root/.claude/plans/valiant-crafting-newt.md` for the full design plan.
