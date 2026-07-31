# Generated media fixtures

These six `.mp4` files are **procedurally generated placeholder video**
(ffmpeg `gradients` + `noise` lavfi filters, tinted per weather category),
not real weather footage. They exist so the Phase 3 feed has genuine
playable video rather than blank panels, while staying honest that this is
demonstration content — the same posture as `src/lib/map/seedEvents.ts`.

Regenerate with (from the repository root):

```
ffmpeg -y -f lavfi -i "gradients=s=720x1280:d=6:c0=<start-hex>:c1=<end-hex>:x0=100:y0=100:x1=620:y1=1180:speed=0.02" \
  -vf "noise=alls=8:allf=t+u" -c:v libx264 -pix_fmt yuv420p -crf 28 -preset veryfast -t 6 -an \
  public/media/<category>.mp4
```

Replace with real, clearly-licensed weather footage before this leaves
development.
