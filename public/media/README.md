# Media fixtures

`severe-storm.mp4`, `snow.mp4`, and `space-weather.mp4` are real,
clearly-licensed footage — see `docs/media-fixture-licences.md` for source,
creator, licence, and download date for each.

`flood.mp4`, `cyclone.mp4`, and `bushfire-weather.mp4` are still
**procedurally generated placeholder video** (ffmpeg `gradients` + `noise`
lavfi filters, tinted per category), not real weather footage — no source
with an unambiguous licence was found for these categories yet (see the
"Not yet replaced" section of `docs/media-fixture-licences.md`). They exist
so the feed has genuine playable video rather than blank panels, while
staying honest that this is demonstration content — the same posture as
`src/lib/map/seedEvents.ts`.

Regenerate a placeholder with (from the repository root):

```
ffmpeg -y -f lavfi -i "gradients=s=720x1280:d=6:c0=<start-hex>:c1=<end-hex>:x0=100:y0=100:x1=620:y1=1180:speed=0.02" \
  -vf "noise=alls=8:allf=t+u" -c:v libx264 -pix_fmt yuv420p -crf 28 -preset veryfast -t 6 -an \
  public/media/<category>.mp4
```

Replace `flood.mp4`, `cyclone.mp4`, and `bushfire-weather.mp4` with real,
clearly-licensed weather footage before this leaves development.
