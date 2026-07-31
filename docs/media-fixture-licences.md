# Media fixture licences

Local copies only — no hotlinking. Each entry below is a file actually
committed under `public/media/`, downloaded and verified in this pass.

## Sourced (real footage, verified licence)

### `public/media/severe-storm.mp4` — Lightning Storm
- **Source:** https://archive.org/details/LightningPhotoJPEG
- **Creator:** Jeffrey Beach (Beachfront Productions)
- **Licence:** Creative Commons Attribution 3.0 (CC BY 3.0) — attribution required.
- **Attribution:** "Lightning Storm" by Jeffrey Beach (Beachfront Productions), CC BY 3.0, via Internet Archive.
- **File downloaded:** `Lightning PhotoJPEG.mp4`, 3,951,546 bytes (verified against the server-reported `Content-Length`).
- **Download date:** 2026-07-31.

### `public/media/snow.mp4` — Snowflake
- **Source:** https://archive.org/details/SnowflakeFreeStockFootage
- **Creator:** Jeffrey Beach (Beachfront Productions)
- **Licence:** Creative Commons Attribution 3.0 (CC BY 3.0) — attribution required.
- **Attribution:** "Snowflake" by Jeffrey Beach (Beachfront Productions), CC BY 3.0, via Internet Archive.
- **File downloaded:** `Snowflake PhotoJPEG.mp4`, 2,679,104 bytes (verified against the server-reported `Content-Length`).
- **Download date:** 2026-07-31.

### `public/media/space-weather.mp4` — ISS Aurora Australis timelapse
- **Source:** https://svs.gsfc.nasa.gov/30179/
- **Creator:** NASA / Earth Science and Remote Sensing Unit, NASA Johnson Space Center (ISS Expedition 29 crew)
- **Licence:** U.S. Government work — public domain (17 U.S.C. §105). NASA requests, but does not legally require, credit per its media guidelines.
- **Attribution:** Credit: NASA / Earth Science and Remote Sensing Unit, NASA Johnson Space Center.
- **File downloaded:** `iss029_aurora_20110917_h265_720p.mp4` (1280x720, H.265), 9,387,549 bytes (verified against the server-reported `Content-Length`).
- **Download date:** 2026-07-31.

## Not yet replaced — still procedurally generated placeholders

`public/media/flood.mp4`, `public/media/cyclone.mp4`, and
`public/media/bushfire-weather.mp4` remain the ffmpeg-generated placeholders
described in `public/media/README.md`. No source with an unambiguous,
verifiable licence was found for these three categories in this pass:

- **Flood:** the most promising lead (NOAA/NSSL "Rain / Flood" b-roll,
  https://vimeo.com/showcase/weather) does not state explicit usage terms
  on the page reachable in this pass — genuine licensing uncertainty, not
  pursued further rather than guessed at.
- **Cyclone / bushfire-weather:** not searched for a specific source in this
  pass (time-boxed to the categories above); still open.

Do not replace these three without the same verification standard applied
above (explicit licence statement + local copy + recorded provenance).

## Verification method

For each file: confirmed the licence/rights statement on the source page,
downloaded the file with `curl`, and compared the downloaded byte count
against the server's reported `Content-Length` / file-listing size before
committing it. All three sourced files pass `ffprobe` as valid, decodable
MP4 video.
