export function computeThumbnailDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const w = Math.max(1, srcWidth)
  const h = Math.max(1, srcHeight)
  const scale = Math.min(maxWidth / w, maxHeight / h, 1)
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  }
}

export function generateThumbnailDataUrl(
  sourceDataUrl: string,
  options: { maxWidth: number; maxHeight: number; quality?: number },
): string {
  if (!sourceDataUrl || !sourceDataUrl.startsWith('data:image/')) return ''

  const { maxWidth, maxHeight, quality = 0.6 } = options

  const img = new Image()
  img.src = sourceDataUrl

  if (img.width === 0 || img.height === 0) return ''

  const dims = computeThumbnailDimensions(img.width, img.height, maxWidth, maxHeight)

  const canvas = document.createElement('canvas')
  canvas.width = dims.width
  canvas.height = dims.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.drawImage(img, 0, 0, dims.width, dims.height)
  return canvas.toDataURL('image/jpeg', quality)
}
