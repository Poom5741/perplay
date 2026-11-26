#!/bin/bash
# Assemble PerPlay demo video from still frames with zoompan + crossfades.
set -euo pipefail
FF=/opt/homebrew/bin/ffmpeg
DIR=/Users/poom-work/perplay/video
FRAMES=$DIR/frames
WORK=$DIR/work
OUT=$DIR/out/perplay-demo.mp4
mkdir -p "$WORK" "$DIR/out"

FPS=30
DUR=12      # seconds per beat
ZOOM_DUR=$((DUR * FPS))
CARDS="00-title 99-end"

# Title / end cards: static, no zoompan
for c in $CARDS; do
  $FF -y -loop 1 -i "$FRAMES/$c.png" -vf "format=yuv420p" -t 5 -r $FPS -c:v libx264 -preset medium -crf 18 "$WORK/$c.mp4"
done

# Beat clips
i=0
for f in 01-catalog-hero 02-catalog-songs 03-pay-page 04-pay-qr 05-verified 06-receipt-settlement 07-dashboard-till 08-dashboard-settlement 09-bond-cournot 12-setlist-refusal; do
  i=$((i+1))
  $FF -y -loop 1 -i "$FRAMES/$f.png" -vf "
  scale=2400:1500,zoompan=z='1+0.05*on/$ZOOM_DUR':d=$ZOOM_DUR:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=$FPS,
  format=yuv420p
  " -t $DUR -r $FPS -c:v libx264 -preset medium -crf 18 "$WORK/$(printf '%02d' $i)-beat.mp4"
done

# End card rendered by the CARDS loop above (99-end.png)

# Concat list with crossfades
cd "$WORK"
CLIPS=(00-title.mp4)
for n in $(seq -w 1 10); do CLIPS+=("$n-beat.mp4"); done
CLIPS+=(99-end.mp4)

# Build filter_complex for xfade chain (card len 5, beats len 12, fade 0.8)
N=${#CLIPS[@]}
FILTER=""
INPUTS=""
for idx in "${!CLIPS[@]}"; do INPUTS+=" -i ${CLIPS[$idx]}"; done

# length of clip k: 0 -> 5, 1..N-2 -> 12, N-1 -> 5
lenof() { if [ "$1" -eq 0 ] || [ "$1" -eq $((N-1)) ]; then echo 5; else echo 12; fi; }

acc=5
for k in $(seq 1 $((N-1))); do
  out="v$k"
  off=$(python3 -c "print(round($acc - 0.8, 1))")
  if [ "$k" -eq 1 ]; then
    FILTER+="[0:v][1:v]xfade=transition=fade:duration=0.8:offset=$off[$out];"
  else
    FILTER+="[v$((k-1))][$k:v]xfade=transition=fade:duration=0.8:offset=$off[$out];"
  fi
  acc=$(python3 -c "print(round($acc + $(lenof $k) - 0.8, 1))")
  lastout=$out
done

$FF -y $INPUTS -filter_complex "$FILTER" -map "[$lastout]" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p "$OUT"
echo "DONE $OUT"
