// Client-side collage generator for MoodBoard.
//
// Loads board images onto an off-screen Canvas, arranges them into a
// portrait-ratio collage using predefined layout templates, and returns
// the canvas for preview + download.  No server round-trips, no storage.
//
// The only export is:
//   generateCollage(imageUrls, seed, options?) → Promise<{ canvas, included, skipped }>
//
// Options:
//   gap           — pixels between (and around) each image tile (default 6)
//   cornerRadius  — border-radius on each tile in pixels (default 0)
//   theme         — 'dark' | 'light' — background/padding color

// ---------------------------------------------------------------------------
// Canvas dimensions
// ---------------------------------------------------------------------------

const CANVAS_W = 1200
const CANVAS_H = 1600

const THEME_COLORS = {
  dark: '#111827',
  light: '#f5f7fb'
}

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
// Layout templates  (1–7 slots)
// ---------------------------------------------------------------------------

const LAYOUTS = {
  1: [
    [{ x: 0, y: 0, w: 1, h: 1 }]
  ],
  2: [
    [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 }
    ],
    [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 }
    ]
  ],
  3: [
    [
      { x: 0, y: 0, w: 1, h: 0.55 },
      { x: 0, y: 0.55, w: 0.5, h: 0.45 },
      { x: 0.5, y: 0.55, w: 0.5, h: 0.45 }
    ],
    [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.55, y: 0, w: 0.45, h: 0.5 },
      { x: 0.55, y: 0.5, w: 0.45, h: 0.5 }
    ]
  ],
  4: [
    [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ],
    [
      { x: 0, y: 0, w: 1, h: 0.55 },
      { x: 0, y: 0.55, w: 1 / 3, h: 0.45 },
      { x: 1 / 3, y: 0.55, w: 1 / 3, h: 0.45 },
      { x: 2 / 3, y: 0.55, w: 1 / 3, h: 0.45 }
    ]
  ],
  5: [
    [
      { x: 0, y: 0, w: 0.5, h: 0.4 },
      { x: 0.5, y: 0, w: 0.5, h: 0.4 },
      { x: 0, y: 0.4, w: 1 / 3, h: 0.6 },
      { x: 1 / 3, y: 0.4, w: 1 / 3, h: 0.6 },
      { x: 2 / 3, y: 0.4, w: 1 / 3, h: 0.6 }
    ],
    [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.55, y: 0, w: 0.45, h: 0.25 },
      { x: 0.55, y: 0.25, w: 0.45, h: 0.25 },
      { x: 0.55, y: 0.5, w: 0.45, h: 0.25 },
      { x: 0.55, y: 0.75, w: 0.45, h: 0.25 }
    ]
  ],
  6: [
    [
      { x: 0, y: 0, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 0, w: 0.5, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 2 / 3, w: 0.5, h: 1 / 3 }
    ],
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
    [
      { x: 0, y: 0, w: 0.5, h: 0.3 },
      { x: 0.5, y: 0, w: 0.5, h: 0.3 },
      { x: 0, y: 0.3, w: 1 / 3, h: 0.4 },
      { x: 1 / 3, y: 0.3, w: 1 / 3, h: 0.4 },
      { x: 2 / 3, y: 0.3, w: 1 / 3, h: 0.4 },
      { x: 0, y: 0.7, w: 0.5, h: 0.3 },
      { x: 0.5, y: 0.7, w: 0.5, h: 0.3 }
    ],
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
    img.onerror = () => resolve(null)
    img.src = url
  })
}

async function loadAllImages(urls) {
  const results = await Promise.all(urls.map(loadImage))
  const loaded = results.filter(Boolean)
  return { loaded, skipped: results.length - loaded.length }
}

// ---------------------------------------------------------------------------
// Diagonal fill scoring
// ---------------------------------------------------------------------------

function diagonalScore(slot, direction) {
  const cx = slot.x + slot.w / 2
  const cy = slot.y + slot.h / 2
  if (direction === 'tl-br') return cx + cy
  return cx + (1 - cy)
}

// ---------------------------------------------------------------------------
// Rounded-corner clipping path
// ---------------------------------------------------------------------------
// Canvas doesn't have a built-in border-radius. This creates a clipping
// region with rounded corners using arcTo, then any subsequent draw call
// is confined to the rounded rect.  Use with ctx.save() / ctx.restore().

function roundedClip(ctx, x, y, w, h, radius) {
  // Clamp radius so it never exceeds half the shortest side
  const r = Math.min(radius, w / 2, h / 2)
  if (r <= 0) return // no clipping needed

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
  ctx.clip()
}

// ---------------------------------------------------------------------------
// Cover-crop drawing  (object-fit: cover on Canvas)
// ---------------------------------------------------------------------------

function drawCover(ctx, img, dx, dy, dw, dh) {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const slotRatio = dw / dh

  let sx, sy, sw, sh
  if (imgRatio > slotRatio) {
    sh = img.naturalHeight
    sw = sh * slotRatio
    sx = (img.naturalWidth - sw) / 2
    sy = 0
  } else {
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

export async function generateCollage(imageUrls, seed, options = {}) {
  const gap = options.gap ?? 6
  const cornerRadius = options.cornerRadius ?? 0
  const bgColor = THEME_COLORS[options.theme] || THEME_COLORS.dark

  const rng = mulberry32(hashSeed(seed + '-' + Date.now()))

  // ---- load images FIRST (pre-check CORS) --------------------------------
  const { loaded, skipped } = await loadAllImages(imageUrls)

  if (loaded.length === 0) {
    throw new Error(
      'No images could be loaded (all failed due to CORS or network errors)'
    )
  }

  // ---- pick layout based on how many actually loaded ---------------------
  const slotCount = Math.min(loaded.length, 7)
  const variants = LAYOUTS[slotCount]
  const layout = variants[Math.floor(rng() * variants.length)]

  // ---- select images (seeded shuffle, take first slotCount) --------------
  const shuffled = seededShuffle(loaded, rng)
  const selected = shuffled.slice(0, slotCount)

  // ---- assign images diagonally from a corner ----------------------------
  const direction = rng() > 0.5 ? 'tl-br' : 'bl-tr'

  const slotsWithIndex = layout.map((s, i) => ({ ...s, idx: i }))
  slotsWithIndex.sort(
    (a, b) => diagonalScore(a, direction) - diagonalScore(b, direction)
  )

  const assignments = new Array(layout.length).fill(null)
  for (let i = 0; i < slotsWithIndex.length; i++) {
    const slot = slotsWithIndex[i]
    assignments[slot.idx] = { type: 'image', img: selected[i] }
  }

  // ---- draw everything onto the canvas -----------------------------------
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')

  // Background fill — visible in the gaps and around rounded corners
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  const halfGap = gap / 2

  for (let i = 0; i < layout.length; i++) {
    const slot = layout[i]
    const dx = Math.round(slot.x * CANVAS_W + halfGap)
    const dy = Math.round(slot.y * CANVAS_H + halfGap)
    const dw = Math.round(slot.w * CANVAS_W - gap)
    const dh = Math.round(slot.h * CANVAS_H - gap)

    ctx.save()
    if (cornerRadius > 0) {
      roundedClip(ctx, dx, dy, dw, dh, cornerRadius)
    }
    drawCover(ctx, assignments[i].img, dx, dy, dw, dh)
    ctx.restore()
  }

  return {
    canvas,
    included: selected.length,
    skipped
  }
}
