# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-thaifi-mainnet-for-receipts.md
│   └── ...
└── worker/          ← PoC app (Cloudflare Worker + D1)
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

Domain terms already fixed by the grilling session (2026-11-21): **play** (one licensed performance of a song in a venue) · **receipt** (on-chain anchored play record) · **split** (70 label / 10 venue / 20 platform) · **setlist** (pre-registered song list for live bands, the non-mocked verify path) · **fingerprint verify is mocked** in the PoC · **chain = ThaiFi mainnet (chain 17)**.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0001 (ThaiFi mainnet for receipts), but worth reopening because…_
