# Research: BNB Bangkok "Build, Demo, and Pitch" Hackathon + LivingBrain API

**Date:** 2026-11-25 · **Author:** research subagent (for lead) · **Language:** English (team rule)

---

## Source 1: BNB Chain "Bangkok Build" Hackathon & Demo Night

Primary source: https://www.bnbchain.org/en/blog/bnb-bangkok-build-demo-and-pitch

### Event overview
- **BNB Bangkok: Build, Demo, and Pitch — November 25–27, 2026**, Bangkok. Builders, founders, investors; themes: **RWA, Trading, AI**. (blog TL;DR + intro)
- **⚠️ Timing note: the event STARTS TODAY (Nov 25, 2026)** — the 36-hour Developer Track build begins the evening of Nov 25 (blog "Key Dates" table). Any participation decision is extremely time-sensitive.

### Structure: two tracks (+ a combined path)
- **Developer Track**: open to all builders in AI, RWA, or Trading; "freedom to explore original ideas, combine disciplines, and build across themes". Teams **build during the event** (36 hours) and present at Demo Night on Friday Nov 27. Sponsor challenges "will be announced later" — as of the blog, **no named sponsor track prizes** are listed. (blog, Developer Track + Prizes sections)
- **Startup Track**: bring an **existing, mature project**; select the Startup Track ticket during Demo Night registration. Shortlisted teams pitch to industry VCs. **Three projects are selected**, prioritizing: **live products with users, demonstrated traction, investment readiness, and alignment with AI, Trading, Payments, or RWA**. (blog, Startup Track section)
- **Both tracks**: Startup teams may also join the 36-hour Developer Track build (e.g. integrating sponsor technologies into an existing product). Blog instructs: "**Clearly distinguish new work from existing work.**" Requires completing both registrations. (blog, Startup Track section)

### Main prizes
- **Developer Track**: 1st **$5,000** cash + up to $50,000 Kickstart Ecosystem Support; 2nd $3,000; 3rd $2,000. All winners: fast-track interviews for **YZi Labs EASY Residency** + access to potential investment through **BNB Chain & YZi Labs' $1B Builder Fund**. (blog, Prizes table)
- **Startup Track**: fast-track to YZi Labs EASY Residency + access to potential investment through the $1B Builder Fund (no cash prize listed). (blog)

### Judging criteria (what judges look for)
- **Developer Track**: **Design and Usability, Scalability, Innovation, Open Source, and Integration.** "Showcase your roadmap and community engagement, with a clear path to a sustainable business model." (blog, Judging section)
- **Startup Track**: "demonstrate your live product, user traction, and readiness for investment." (blog, Judging section)
- Note: **Open Source is an explicit criterion** — repo visibility/licensing matters.

### Key dates & logistics
| Date | Stage | Detail |
|---|---|---|
| Nov 25 | Developer Track begins | 36-hour build starts in the evening |
| Nov 26 | Building continues | Including dual-track teams |
| Nov 27 (morning) | Build period ends | Projects finished for judging |
| Nov 27 (afternoon/evening) | Presentations & pitches | Dev Track presents to sponsors + main judging panel; selected Startup teams pitch to VCs |

- **Demo Night**: Park Hyatt Bangkok, **Friday Nov 27, 15:00–18:00** (main-stage demos + awards at 15:00; closing party/networking 18:30). Attendance free but requires separate registration and approval; Demo Night registration does **not** register you for the hackathon. (blog, "Join Demo Night")

### Submission/joining rules
- Developer Track only: register for the hackathon (36-hour build); apply individually with team name and a **GitHub or portfolio link**.
- Startup Track only: apply to pitch at Demo Night with the Startup Track ticket; three projects selected.
- Both: complete both registrations; prepare a build and, if selected, a separate Startup Track pitch. (blog, "How to Join")

---

## Source 2: LivingBrain (Living Brain API) documentation

Primary sources: https://docs.livingbrain.com (landing), https://docs.livingbrain.com/llms.txt (index), and the linked `.md` docs pages cited inline below.

### What the service is
- **Living Brain** (by ChatAndBuild, **"now in early access"**) "turns everything your users read, write, and say into a knowledge vault that compounds" — captures become compiled **pages**, the service links related pages, and agents read/write via REST API, SDKs, CLI, and a hosted **MCP server** (60+ tools). (landing + llms.txt)
- Core loop: **Capture → Extract → Route → Patch → Record → Embed & link** (async background pipeline per source: `pending → compiling → completed/failed`). (https://docs.livingbrain.com/docs/concepts.md)

### Key concepts (concepts.md)
- **Brain**: isolated knowledge store; every brain belongs to one **subject** (end user). "Most products create one brain per end user."
- **Capture kinds**: `note`, `url`, `file` (PDF/DOCX/PPTX), `transcript`, `chat_turn`, `integration`. Inline content capped at **50,000 characters**. Capturing is async; `originRef` makes captures idempotent (retry-safe).
- **Page**: compiled knowledge, addressed by `slug`, with `title`/`summary`/`body`, version history, source links, `pageType` (`source|topic|entity|project|decision|brief`), status `active|stale|contested|deprecated|archived`. Conflicting material marks pages `contested` (kept both claims until resolved).
- **Buckets**: `inbox|notes|ideas|projects`.
- **Connections**: auto or manual links between pages, strength `strong|medium|weak`.
- **Change events / webhooks** (e.g. `brain.page.updated`), **brain profile** (standing directives), **brain health** (Freshness/Readiness/Strain). (concepts.md, build.md)

### API surface & auth
- Base: `https://api.livingbrain.com/v1/...` (e.g. `POST /v1/brains`). Every request carries **two headers**: `x-api-key` (org-scoped key, format `lbk_...`) and `x-subject-id` (UUID of the end user — brains are owned by subjects). (authentication.md, landing quickstart)
- Roles: Owner/Admin/Developer/Viewer; keys inherit the issuing member's role. Keys are bearer credentials for the whole org — keep server-side. (authentication.md)
- Endpoint groups (llms.txt API Docs): **Workspace** (search pages, prompt index, graph, list/read/edit/move/pin/archive/restore pages, page versions & connections, change feed + ack, brain health score, profile, export markdown), **Brains** (CRUD, stats, daily brief), **Captures** (capture, batch, chat turn, ingest-source list/retry/delete), **Webhooks** (CRUD), **Telegram** & **Slack** (status/OAuth/bindings).
- Search is hybrid semantic+keyword with a prompt index for agent sessions; guidance: load the index once per session, search per question, read the full page before answering, cite page `slug`+`version`, escalate unanswered questions rather than letting the model guess. (build.md, search pages)

### Integration surfaces
- **REST + SDKs**: TypeScript `@living-brain/sdk`, Python `livingbrain-sdk`. (llms.txt, quickstart)
- **CLI**: `livingbrain` command for every operation — usable from terminals/CI. (landing CLI section)
- **MCP**: hosted server; one snippet install for Claude Code, Codex, Cursor, VS Code, Hermes, OpenClaw; ChatGPT/Claude can connect by sign-in (no key). (landing MCP section, mcp guide)

### Pricing / limits
- **Not public in the docs.** The site says "Now in early access"; no pricing page was indexed in llms.txt. Known limits: 50,000-char inline capture cap; async compile; org-role permissions. Everything else (rate limits, quotas, cost) = **unknown/unpublished at research time**. (landing, llms.txt, concepts.md)

### Plausible use
Any agent or app that needs persistent, cross-session memory: push captures (notes/URLs/transcripts/chat turns) with `originRef`, get webhooks when pages compile, search + read pages to answer, keep answers source-cited. Documented use cases include coding-agent memory, shared rules in code review, idea-to-pull-request, and one brain across many AI tools. (https://docs.livingbrain.com/docs/use-cases.md via llms.txt)

---

## How perplay could qualify

Context: perplay = per-play music licensing PoC (see `POC-SPEC.md`, `DECISION.md`, `pitch/`): QR song request → PromptPay → fingerprint verification (ACRCloud / setlist mode) → receipt anchored on Base testnet → automatic split ledger (70/10/20) + dashboards. **Dev-track judging criteria mapping (all "could build" = proposals, not commitments):**

| Judging criterion | Concrete perplay move |
|---|---|
| **Innovation** | Per-play micropayments + AI fingerprint oracle closing the "paid-but-not-played" gap is a genuinely novel licensing model. Lead with the Grammy demand story (DECISION.md). |
| **Integration** | Receipt anchoring already targets **Base testnet** — a natural BNB/opBNB story is to demo the same receipt flow on **opBNB** (or present Base→opBNB as the deployable chain), plus integrate a sponsor tech once announced. |
| **Open Source** | Keep the PoC repo public on GitHub (Poom5741/perplay) with a clear license; judges explicitly evaluate this. |
| **Design & Usability** | The 5-minute, non-tech-friendly demo script and 3-screen QR flow (POC-SPEC hypotheses 1–3) is directly the "Design and Usability" story. |
| **Scalability** | Show per-play cost <1 THB and chain-fee math; outline scale to 5,000+ venues (DECISION.md market math). |
| **Roadmap/sustainable business** | Pitch deck in `pitch/` covers the revenue model (platform % per play); state the path: TED pitch → Grammy LOI → sandbox pilot. |

### "Two brains" architecture idea (proposal/assumption — not built)
- **Brain #1 — repo brain on GitHub**: a CI/GitHub-agent that automates the repo (issue triage onto the perplay board, PR review against POC-SPEC, capturing decisions into docs). Could be implemented with existing repo automation + an agent harness. *(assumption: feasible with tooling we already use, but not yet implemented)*
- **Brain #2 — cloud brain on LivingBrain**: a LivingBrain brain as the project's cross-session memory: capture every decision (DECISION.md updates, Grammy call outcomes, hackathon learnings) via the API/CLI with `originRef`, and let any agent (Claude Code/Hermes via MCP) recall them. LivingBrain's own "coding agent memory" and "idea-to-pull-request" use cases mirror this exactly (concepts.md, use-cases index). *(confirmed: the API/MCP surfaces support this; assumption: it adds demo value for judges)*
- **Demo narrative**: Brain #1 (repo agent) commits a new venue config; Brain #2 (LivingBrain) remembers *why* each split config/label deal was chosen and answers judges' questions with source-cited pages; meanwhile the venue demo plays a song and the receipt lands on-chain in ≤30s. Ties "AI" theme + agent stack to a real music-rights product.

### Which prize path fits
- **Developer Track** (main fit): build a perplay slice during the 36h window with an opBNB/BNB receipt integration; targets the $5K + ecosystem prizes. *(time-critical: build starts tonight)*
- **Startup Track**: only if a live product with users/traction can be shown — the perplay PoC is pre-user, so this track **likely does not fit yet** unless the pilot gains traction before selection.
- **Caveat / assumption**: blog themes are AI, RWA, Trading (Developer) and AI/Trading/**Payments**/RWA (Startup). Per-play licensing is plausibly "Payments/RWA-adjacent" (music rights as RWAs, micropayments) but the blog does not confirm music/rights projects fit the theme scope. *(assumption)*

### Facts vs. assumptions recap
- **Confirmed (cited above)**: event dates/prizes/judging criteria; LivingBrain API shape, auth model, capture pipeline, MCP/CLI/SDK surfaces, early-access status.
- **Assumptions**: perplay fits the hackathon themes; two-brains adds judged value; LivingBrain pricing/quotas are workable for a hackathon (unpublished); no sponsor track details exist yet ("announced later").

---

## Open questions / uncertainties
1. Registration windows: the blog does not state a registration deadline — is same-day registration for the Nov 25 build still possible?
2. Sponsor challenges/track prizes were "to be announced later" — are they published anywhere now?
3. LivingBrain pricing, rate limits, and whether an early-access key can be issued for perplay in time for a demo.
4. Whether receipt-anchoring on Base (per POC-SPEC) must be ported to opBNB/BNB Chain for hackathon credibility — the blog never says submissions must be on BNB Chain, only that ecosystem support exists.
