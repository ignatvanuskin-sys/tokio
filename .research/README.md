# .research — provenance of site data

Everything in this folder is **raw research material**, not site code. Most of it
is ignored by git; only the files below are committed, because they document
where the facts and photographs on the site came from.

| File | What it is |
|---|---|
| `results.json` | Everything extracted from the 2GIS card of «Токио» (firm `70000001056265130`): name, category, rating, address, hours, geo, contacts, services, features, brands, payments, description, photo URLs. Captured 2026-09-26. |
| `photos_manifest.json` | One entry per photo: the 2GIS URL it was downloaded from, the local file name and its byte size. This is the audit trail behind `public/photos/*`. |

## Regenerating site assets

```bash
# 1. Put the 17 originals here (watermark-free versions from the owner is best):
#      .research/photos_raw/p01.jpg … p17.jpg
# 2. Rebuild:
npm run images                 # responsive WebP + LQIP + asset manifest
node scripts/build-map.mjs     # static map from 2GIS tiles
node scripts/build-og.mjs      # social preview image
node scripts/fetch-reviews.mjs # refresh real reviews
npm run fonts                  # self-hosted webfonts
```

## Notes

* `photos_raw/` is git-ignored — 17 full-resolution JPEGs are large and fully
  reproducible from `photos_manifest.json`.
* The photographs currently in use are the 2GIS-hosted copies and carry a small
  「2GIS」 watermark. See the "Что требует владельца" section of the root README.
* Review text is quoted **verbatim** (original Russian, typos included) with the
  author's 2GIS display name. Nothing here is paraphrased or invented.
