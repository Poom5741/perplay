# Seedance B-roll — prompts, params, budget

Provider: **BytePlus ModelArk** (international, region `ap-southeast-1`).
Auth: `Authorization: Bearer $ARK_API_KEY`. Create + poll:

```bash
POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks
GET  https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks/{id}
```

Task states: `queued → running → succeeded | failed | expired`. On success: `content.video_url` (valid ~24 h — download immediately). Output is 24 fps; 5 s at 720p typically renders in 1–4 min.

## Rule

Seedance renders **atmosphere only**: nightlife, vinyl, phone-in-hand abstraction, vault, abstract motion. It never renders the product UI, any legible text, or real faces (small text garbles and would read as fake to judges).

## Shot list

| id | beat | prompt | notes |
|---|---|---|---|
| `b1-alley` | 1 | Cinematic slow dolly-in down a rain-wet Bangkok alley at night, neon signs reflecting in puddles, warm amber and deep navy palette, distant live-band silhouettes behind fogged bar windows, 35 mm anamorphic look, shallow depth of field, gentle handheld drift, no text, no readable signage, no faces. | hook |
| `b2-vinyl` | 2 | Extreme macro of a vinyl record spinning on a turntable, dust motes in a single warm beam of light, deep navy background, brass-toned highlights, shallow focus, slow orbital camera move, no text. | problem |
| `b3-receipts` | 2→3 transition | Abstract motion design: a fine brass sound waveform dissolving into a stream of small cream paper receipts drifting upward in a deep navy void, elegant slow camera drift, soft volumetric light, no text. | transition |
| `b4-phone` | 4→5 | Close-up cinematic shot of a hand holding a dark phone over a bar table, screen glowing with an abstract QR-like pattern of light (unreadable, no text), neon bokeh behind, warm amber and purple light, shallow depth of field, no faces. | product moment |
| `b5-vault` | 9 | Abstract brass vault mechanism slowly locking inside a dark navy chamber, thin green rim light, floating particles, slow push-in, metaphor for trust, no text. | trust |
| `b6-stage` | 1 alt | Silhouettes of a four-piece live band on a small dim stage, backlit haze, warm amber spotlights, camera slowly cranes upward, cinematic, no faces, no text. | hook alt |
| `b7-paper` | 3 / 12 bg | Minimal abstract background: soft cream paper texture with a faint thin brass grid, slow drifting light, vignette at edges, elegant, no text. | title/end bg |

## Request shape

```json
{
  "model": "dreamina-seedance-2-0-fast-260128",
  "content": [{ "type": "text", "text": "<prompt above>" }],
  "duration": 5,
  "ratio": "16:9",
  "resolution": "720p",
  "generate_audio": false,
  "watermark": false,
  "return_last_frame": false
}
```

- **Drafts:** `dreamina-seedance-2-0-fast-260128`, 720p, 5 s — cheapest iteration (~$0.60 / clip).
- **Finals:** `dreamina-seedance-2-0-260128`, 1080p, 5 s (~$1.87 / clip). Use 2.5 (`dreamina-seedance-2-5-260628`) only if 2.0 fails or a hero shot needs it ($2.84 / 5 s at 1080p).
- 2.x has no seed control — consistency comes from the same prompt language, palette words, and (optional) `reference_image` of a brand plate. Reference images must not contain real faces.
- Rate limit: 3 concurrent / 180 RPM per key → run at most 3 polls at once.

## Budget

7 clips: drafts 7 × $0.60 ≈ $4.2; finals 6 × $1.87 ≈ $11.2; 2 retries ≈ $3.8 → **≈ $20** total, hard cap **$30**. Stop when cap is hit; missing B-roll is replaceable with plates + zoompan stills.

## Fallback

If BytePlus generation fails or the key is not activated: drop clips `b2`, `b3`, `b5`; keep `b1`/`b6` only if available; otherwise use plates `00-title`, `07/08/09-section-*`, `01-end` with zoompan, and let the real UI captures carry the film. The edit must still cut at 2:00+.
