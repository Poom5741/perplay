# PerPlay demo video

`out/perplay-demo.mp4` — 2:01, 1080p, product walkthrough of the full workflow
(catalog → order → PromptPay QR → setlist verify → on-chain 70/10/20 settlement
in MockTHB → receipt anchored on BSC Testnet → venue dashboard till/meters →
VenueStake bond + Cournot guard → setlist-refusal story).

Built from live screenshots of https://perplay-demo.poom-a1d.workers.dev
(captured per beat in `frames/`, not committed) with slow zoom + crossfades via
`assemble.sh` (ffmpeg). Raw frames stay untracked; only the final MP4 and the
assembly script are committed.
