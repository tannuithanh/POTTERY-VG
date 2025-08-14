// tools/prepare-media.js  (ESM)
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import fg from 'fast-glob'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IN_DIR = path.resolve('src/assets/home')
const OUT_DIR = path.resolve('public/home')
const MANIFEST = path.join(OUT_DIR, 'manifest.json')

const THUMB_WIDTH = 1600
const WEBP_Q = 78
const AVIF_Q = 55
const JPEG_Q = 82

;(async () => {
  await fsp.mkdir(OUT_DIR, { recursive: true })
  const entries = await fg(['**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}'], {
    cwd: IN_DIR, onlyFiles: true,
  })

  const items = []
  for (const rel of entries) {
    const abs = path.join(IN_DIR, rel)
    const baseName = path.basename(rel).replace(/\.[^.]+$/, '')
    const safeName = baseName.replace(/\s+/g, '_')
    const title = safeName

    const buf = await fsp.readFile(abs)
    const img = sharp(buf, { failOn: 'none' })

    const thumbAvif = path.join(OUT_DIR, `${safeName}_thumb.avif`)
    const thumbWebp = path.join(OUT_DIR, `${safeName}_thumb.webp`)
    await img.clone().resize({ width: THUMB_WIDTH }).avif({ quality: AVIF_Q }).toFile(thumbAvif)
    await img.clone().resize({ width: THUMB_WIDTH }).webp({ quality: WEBP_Q }).toFile(thumbWebp)

    const fullJpg = path.join(OUT_DIR, `${safeName}_full.jpg`)
    await img.clone().jpeg({ quality: JPEG_Q, mozjpeg: true }).toFile(fullJpg)

    items.push({
      title,
      thumbAvif: `/home/${path.basename(thumbAvif)}`,
      thumbWebp: `/home/${path.basename(thumbWebp)}`,
      full: `/home/${path.basename(fullJpg)}`,
      orderKey: baseName.replace(/\D+/g, '') || baseName.toLowerCase(),
    })
  }

  items.sort((a, b) => {
    const na = +a.orderKey, nb = +b.orderKey
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
    return String(a.orderKey).localeCompare(String(b.orderKey), 'vi')
  })

  await fsp.writeFile(MANIFEST, JSON.stringify(items, null, 2))
  console.log(`✔ Generated ${items.length} entries -> ${MANIFEST}`)
})().catch(err => {
  console.error('❌ prepare-media error:', err)
  process.exit(1)
})
