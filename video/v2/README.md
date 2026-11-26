# perplay-demo v2 — multi-model production pipeline

Goal: replace the silent v1 slideshow (`../out/perplay-demo.mp4`) with a narrated 2:20–2:35 product film, ready to upload before the 09:00 Nov 27 submission close.

## Pipeline (who does what)

| Stage | Actor | Output |
|---|---|---|
| 1. Script + shot table | LLM agent (lead) from repo docs: `poc/DEMO-SCRIPT-EN.md`, `pitch/fourmeme-video-script.md`, `pitch/token-economy-one-pager.md`, `docs/spec/venue-stake-bond.md` | `SCRIPT.md` |
| 2. Brand + proof plates | local HTML/CSS → Chrome 1920×1080 | `plates/*.png` |
| 3. Live UI capture | agent-browser against https://perplay-demo.poom-a1d.workers.dev (real routes, real tx) | `capture/c01..c12.png`, `capture/evidence.json` |
| 4. Narration | ElevenLabs `eleven_v4`, `/with-timestamps` → character-level alignment | `audio/vo.mp3`, `audio/vo-alignment.json`, `work/shotlist.json` |
| 5. Music + SFX | ElevenLabs `music_v2_5`, `/v1/music`; `/v1/sound-generation` | `audio/bed.mp3`, `audio/sfx-*.mp3` |
| 6. B-roll | BytePlus ModelArk Seedance 2.0 (draft 720p → final 1080p), atmosphere only | `clips/b*.mp4` |
| 7. Assembly | ffmpeg: 1080p30 conform, VO-locked cuts, xfade, captions, audio mix | `../out/perplay-demo-v2.mp4`, `.srt` |

The LLM never guesses timing: VO timestamps set the cut points, shots absorb the slack, and B-roll is drafted cheap and finished only after the edit locks.

## Layout

```
video/v2/
  SCRIPT.md          # beats, VO, captions, claims ledger
  PROMPTS.md         # Seedance shot prompts + budget
  prompts/seedance.json
  capture/           # live UI stills + evidence.json (real tx hashes)
  plates/            # brand/proof cards (src/ + rendered PNGs)
  audio/             # vo.mp3, alignment, music, sfx
  clips/             # seedance drafts + finals
  work/              # shotlist.json, intermediate ffmpeg
  fonts/             # IBM Plex Mono / Kanit for burned captions
```

## Run order

1. `node vo.mjs` — VO + timestamps → `work/shotlist.json`
2. `node seedance.mjs draft` (all clips 720p) → review → `node seedance.mjs final <ids>`
3. `node build.mjs` — conform, cut, caption, mix → `../out/perplay-demo-v2.mp4`

Secrets come from `video/v2/.env` (gitignored): `ARK_API_KEY`, `ELEVENLABS_API_KEY`, optional `ELEVENLABS_VOICE_ID`.

## Status

- [x] Script, shot table, claims ledger
- [ ] UI capture (agent)
- [ ] Plates (agent)
- [ ] ElevenLabs VO + timings
- [ ] Seedance clips
- [ ] Assembly + QA
- [ ] Upload + link in PR/HackQuest
