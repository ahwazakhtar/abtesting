# AB Testing Tracker

A small Next.js app for running and **iterating on** AB-testing plans. Built around the workflow in *A Practical Approach to Developing AB Testing Systems for Digital-First Organizations* — and around the messy reality that real-world experiments evolve as ground truth changes (a partner adds an arm, the sample frame triples, the funder asks for a new control).

## What it does

- Walks every experiment through the standard pipeline — **Hypothesis → Research Questions → Design & Sampling → Power & MDE → Measurement → Analysis → Results → Post-mortem**.
- When you give feedback or paste meeting notes, the model proposes a **revised plan** with a per-stage diff and a written rationale. You **review and accept** before it becomes the next version.
- Every accepted change creates a new version. v1 → v2 → v3 are all preserved. You can diff any version against any other.
- Multi-experiment workspace — dashboard lists all studies, click into one to see its plan and version history.
- Comes seeded with the **Digital Coach Promotion Study** showing the real-world v1 → v2 evolution from a 200-teacher 2-arm Islamabad study to a 339-school 3-arm design with embedded IRR calibration.

## Run locally

```bash
cd ab-testing-tracker
npm install
cp .env.local.example .env.local
# Edit .env.local and paste your OpenAI API key
npm run dev
```

Open http://localhost:3000.

The Digital Coach example is pre-seeded — open it and click "Diff vs v1" on the v2 entry in the sidebar to see the full evolution.

### Try the iteration flow

1. Open the Digital Coach experiment.
2. Click **Iterate on plan**.
3. Select **Meeting notes** and paste something like:

   > Funder wants us to drop Group C entirely — too expensive. Reallocate the freed budget to deeper IRR sampling in Group A. Endline now mid-June, not end-May.

4. Hit **Propose changes**. After ~10s you'll get a v3 proposal with a diff. Accept or discard.

## Configuration

Environment variables in `.env.local`:

| Variable | Default | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | _(required)_ | Your OpenAI key. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use. `gpt-4o` gives noticeably better diffs but costs more. |

## Deployment

The app uses **JSON files in `data/`** for storage. That's deliberately simple and means the deployment story depends on whether the host has a writable, persistent disk.

### Render (recommended)

Render gives you a long-lived Node server with a persistent disk on the paid tier. Works perfectly with the JSON-file storage.

1. Push this repo to GitHub.
2. New → Web Service → Build command `npm install && npm run build`, Start command `npm start`.
3. Add a **Disk** mounted at `/opt/render/project/src/data` (any size, even 1 GB).
4. Set `OPENAI_API_KEY` as an env var.

### Vercel

Vercel's serverless functions have a **read-only filesystem** outside `/tmp`, so plain JSON-file writes won't persist between requests in production. Two options:

1. **Use Vercel for read-only deploys.** Commit your `data/` directory to the repo and treat the deployed app as a viewer; do iteration locally and push commits to update.
2. **Swap the storage layer.** Replace `src/lib/storage.ts` with a Vercel KV or Vercel Blob implementation. The interface is small (~7 functions: `listExperiments`, `getExperiment`, `getVersion`, `createExperiment`, `appendVersion`, `deleteExperiment`). Roughly an hour of work.

### Self-hosted Node anywhere (Fly, DigitalOcean App Platform with persistent volume, a VPS, your laptop)

Same pattern as Render. `npm run build && npm start`, mount a writable `data/` directory.

## Project layout

```
src/
  app/
    page.tsx                          # Dashboard
    experiments/new/page.tsx          # Create form
    experiments/[id]/page.tsx         # Experiment detail + sidebar version timeline
    experiments/[id]/iterate/page.tsx # Propose-and-review flow
    experiments/[id]/diff/page.tsx    # Side-by-side version diff
    api/experiments/route.ts          # GET (list) / POST (create + draft v1)
    api/experiments/[id]/route.ts     # GET / DELETE
    api/experiments/[id]/propose      # POST: feedback -> LLM proposal (no persist)
    api/experiments/[id]/versions     # POST: accept proposal as next version
  components/
    Markdown.tsx                      # Markdown renderer with GFM tables
    StageList.tsx                     # Renders all 8 stages
    VersionTimeline.tsx               # Sidebar list of versions
    DiffView.tsx                      # Word-level diff per stage with rationale
  lib/
    types.ts                          # Experiment / Version / Stage types
    storage.ts                        # JSON-file r/w
    openai.ts                         # Client + model
    prompts.ts                        # System prompts for v1 draft + iteration
    diff.ts                           # diff-words wrapper

data/
  index.json                          # Experiment index
  experiments/
    digital-coach-promotion/
      meta.json
      versions/1.json                 # Original 2-arm Islamabad design
      versions/2.json                 # Scaled 3-arm + IRR design
```

## Customizing the framework

The 8 stages (`hypothesis`, `research_questions`, `design`, `power`, `measurement`, `analysis`, `results`, `postmortem`) are defined in `src/lib/types.ts`. To add or rename a stage:

1. Add the ID to `StageId`, `STAGE_ORDER`, and `STAGE_META`.
2. Old version files won't have the new stage — they'll show as empty in the UI, which is fine. The next iteration will fill them in.

The system prompts that govern how the LLM writes plans live in `src/lib/prompts.ts`. Edit `FRAMEWORK` to change the model's voice or principles.
