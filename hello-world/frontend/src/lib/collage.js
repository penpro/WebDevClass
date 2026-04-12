// Client-side collage generator for MoodBoard.
//
// Loads board images onto an off-screen Canvas, arranges them into a
// portrait-ratio collage using predefined layout templates, and returns
// the canvas for preview + download.  No server round-trips, no storage.
//
// The only export is:
//   generateCollage(imageUrls, seed) → Promise<{ canvas, included, skipped }>

// ---------------------------------------------------------------------------
// Canvas dimensions
// ---------------------------------------------------------------------------

const CANVAS_W = 1200
const CANVAS_H = 1600
const GAP = 6

// ---------------------------------------------------------------------------
// Seeded PRNG  (Mulberry32)
// ---------------------------------------------------------------------------

function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h >>> 0
}

function mulberry32(seed) {
  let s = seed | 0
  return function next() {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle(arr, rng) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------------------------------------------------------------------------
// Layout templates
// ---------------------------------------------------------------------------
// Each template is an array of slot objects: { x, y, w, h } expressed as
// fractions of the canvas.  Gap is applied at render time by insetting
// each slot by half-gap on every side.

const LAYOUTS = {
  5: [
    // A: 2 on top (40%), 3 on bottom (60%)
    [
      { x: 0, y: 0, w: 0.5, h: 0.4 },
      { x: 0.5, y: 0, w: 0.5, h: 0.4 },
      { x: 0, y: 0.4, w: 1 / 3, h: 0.6 },
      { x: 1 / 3, y: 0.4, w: 1 / 3, h: 0.6 },
      { x: 2 / 3, y: 0.4, w: 1 / 3, h: 0.6 }
    ],
    // B: 1 large left (55%), stack of 4 right (45%)
    [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.55, y: 0, w: 0.45, h: 0.25 },
      { x: 0.55, y: 0.25, w: 0.45, h: 0.25 },
      { x: 0.55, y: 0.5, w: 0.45, h: 0.25 },
      { x: 0.55, y: 0.75, w: 0.45, h: 0.25 }
    ]
  ],
  6: [
    // A: 3 rows of 2
    [
      { x: 0, y: 0, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 0, w: 0.5, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 2 / 3, w: 0.5, h: 1 / 3 }
    ],
    // B: row of 3 top (45%), row of 3 bottom (55%)
    [
      { x: 0, y: 0, w: 1 / 3, h: 0.45 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.45 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.45 },
      { x: 0, y: 0.45, w: 1 / 3, h: 0.55 },
      { x: 1 / 3, y: 0.45, w: 1 / 3, h: 0.55 },
      { x: 2 / 3, y: 0.45, w: 1 / 3, h: 0.55 }
    ]
  ],
  7: [
    // A: 2 (30%), 3 (40%), 2 (30%)
    [
      { x: 0, y: 0, w: 0.5, h: 0.3 },
      { x: 0.5, y: 0, w: 0.5, h: 0.3 },
      { x: 0, y: 0.3, w: 1 / 3, h: 0.4 },
      { x: 1 / 3, y: 0.3, w: 1 / 3, h: 0.4 },
      { x: 2 / 3, y: 0.3, w: 1 / 3, h: 0.4 },
      { x: 0, y: 0.7, w: 0.5, h: 0.3 },
      { x: 0.5, y: 0.7, w: 0.5, h: 0.3 }
    ],
    // B: 3 (35%), 2 (30%), 2 (35%)
    [
      { x: 0, y: 0, w: 1 / 3, h: 0.35 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.35 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.35 },
      { x: 0, y: 0.35, w: 0.5, h: 0.3 },
      { x: 0.5, y: 0.35, w: 0.5, h: 0.3 },
      { x: 0, y: 0.65, w: 0.5, h: 0.35 },
      { x: 0.5, y: 0.65, w: 0.5, h: 0.35 }
    ]
  ]
}

// ---------------------------------------------------------------------------
// Image loading
// ---------------------------------------------------------------------------

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null) // skip on CORS / 404 / network
    img.src = url
  })
}

async function loadAllImages(urls) {
  const results = await Promise.all(urls.map(loadImage))
  const loaded = results.filter(Boolean)
  return { loaded, skipped: results.length - loaded.length }
}

// ---------------------------------------------------------------------------
// Accent color  (the "1x1 canvas" trick)
// ---------------------------------------------------------------------------

// Draws the center third of an image onto a 1x1 canvas and reads the
// single averaged pixel.  The browser's bilinear scaling does all the
// heavy lifting — no pixel iteration, O(1).
function centerThirdColor(img) {
  const c = document.createElement('canvas')
  c.width = 1
  c.height = 1
  const ctx = c.getContext('2d')
  const sw = img.naturalWidth / 3
  const sh = img.naturalHeight / 3
  ctx.drawImage(img, sw, sh, sw, sh, 0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return { r, g, b }
}

// Complement → pastel: complement the color, push 60% toward white,
// then subtract 20 from each channel for a slightly muted finish.
function pastelComplement({ r, g, b }) {
  let cr = 255 - r
  let cg = 255 - g
  let cb = 255 - b
  cr = Math.round(cr + (255 - cr) * 0.6) - 20
  cg = Math.round(cg + (255 - cg) * 0.6) - 20
  cb = Math.round(cb + (255 - cb) * 0.6) - 20
  return {
    r: Math.max(0, Math.min(255, cr)),
    g: Math.max(0, Math.min(255, cg)),
    b: Math.max(0, Math.min(255, cb))
  }
}

// ---------------------------------------------------------------------------
// Diagonal fill scoring
// ---------------------------------------------------------------------------

// Computes how far a slot's center is from the "start" corner along
// the diagonal axis.  Lower score = closer to the start corner = gets
// a real image first.  Higher score = further away = gets accent fill.
//
// Two directions:
//   'tl-br'  top-left → bottom-right  (score = cx + cy)
//   'bl-tr'  bottom-left → top-right  (score = cx + (1 - cy))
function diagonalScore(slot, direction) {
  const cx = slot.x + slot.w / 2
  const cy = slot.y + slot.h / 2
  if (direction === 'tl-br') return cx + cy
  return cx + (1 - cy)
}

// ---------------------------------------------------------------------------
// Cover-crop drawing  (object-fit: cover on Canvas)
// ---------------------------------------------------------------------------

function drawCover(ctx, img, dx, dy, dw, dh) {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const slotRatio = dw / dh

  let sx, sy, sw, sh
  if (imgRatio > slotRatio) {
    // Image is wider than the slot: crop left/right
    sh = img.naturalHeight
    sw = sh * slotRatio
    sx = (img.naturalWidth - sw) / 2
    sy = 0
  } else {
    // Image is taller than the slot: crop top/bottom
    sw = img.naturalWidth
    sh = sw / slotRatio
    sx = 0
    sy = (img.naturalHeight - sh) / 2
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function generateCollage(imageUrls, seed) {
  // Mix the board's share_token with the current time so each click
  // produces a different collage.  Still Mulberry32 — local PRNG math,
  // no cloud dependencies, no system CSPRNG.
  const rng = mulberry32(hashSeed(seed + '-' + Date.now()))

  // ---- load images -------------------------------------------------------
  const { loaded, skipped } = await loadAllImages(imageUrls)

  if (loaded.length === 0) {
    throw new Error(
      'No images could be loaded (all failed due to CORS or network errors)'
    )
  }

  // ---- pick how many slots and which layout variant ----------------------
  const usable = Math.min(loaded.length, 7)
  const slotCount = usable >= 7 ? 7 : usable >= 6 ? 6 : 5
  const variants = LAYOUTS[slotCount]
  const layout = variants[Math.floor(rng() * variants.length)]

  // ---- select images (seeded shuffle, take first N) ----------------------
  const shuffled = seededShuffle(loaded, rng)
  const selected = shuffled.slice(0, Math.min(slotCount, loaded.length))

  // ---- assign images diagonally from a corner ----------------------------
  // Images fill from one corner and cascade toward the opposite corner;
  // accent fills (if any) end up in the far corner, keeping the real
  // images as the dominant visual element.
  const direction = rng() > 0.5 ? 'tl-br' : 'bl-tr'

  const slotsWithIndex = layout.map((s, i) => ({ ...s, idx: i }))
  slotsWithIndex.sort(
    (a, b) => diagonalScore(a, direction) - diagonalScore(b, direction)
  )

  const assignments = new Array(layout.length).fill(null)
  for (let i = 0; i < slotsWithIndex.length; i++) {
    const slot = slotsWithIndex[i]
    if (i < selected.length) {
      assignments[slot.idx] = { type: 'image', img: selected[i] }
    } else {
      // Pick a nearby real image for the accent color
      const sourceImg = selected[i % selected.length]
      const color = pastelComplement(centerThirdColor(sourceImg))
      assignments[slot.idx] = { type: 'accent', color }
    }
  }

  // ---- draw everything onto the canvas -----------------------------------
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')

  // Background (visible only in the gaps between slots)
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  const halfGap = GAP / 2

  for (let i = 0; i < layout.length; i++) {
    const slot = layout[i]
    const dx = Math.round(slot.x * CANVAS_W + halfGap)
    const dy = Math.round(slot.y * CANVAS_H + halfGap)
    const dw = Math.round(slot.w * CANVAS_W - GAP)
    const dh = Math.round(slot.h * CANVAS_H - GAP)

    const assignment = assignments[i]
    if (assignment.type === 'image') {
      drawCover(ctx, assignment.img, dx, dy, dw, dh)
    } else {
      const { r, g, b } = assignment.color
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(dx, dy, dw, dh)
    }
  }

  return {
    canvas,
    included: selected.length,
    skipped
  }
}
