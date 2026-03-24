import * as fabric from 'fabric'
import type { PlaceholderObject } from '../types/canvas'
import { loadWithReviver } from '../utils/canvasIO'
import { fitImageToTarget } from '../utils/imageFitting'
import { generateQrDataUrl } from '../utils/qrcode'
import { fitTextboxText, type TextboxWithBounds } from '../utils/textLayout'

interface FieldValueGetter {
  getCellText: (fieldId: string, recordId: string) => Promise<string>
  getAttachmentUrls: (fieldId: string, recordId: string) => Promise<string[]>
}

export async function generatePosterForRecord(
  canvasJson: string,
  recordId: string,
  getter: FieldValueGetter,
  multiplier = 2,
  shouldCancel?: () => boolean,
): Promise<Blob | null> {
  if (shouldCancel?.()) {
    return null
  }

  const offscreen = document.createElement('canvas')
  const parsed = JSON.parse(canvasJson)
  const width = parsed.width ?? 800
  const height = parsed.height ?? 1200

  offscreen.width = width
  offscreen.height = height

  const tempCanvas = new fabric.StaticCanvas(offscreen, { width, height })

  await loadWithReviver(tempCanvas, canvasJson)

  const objects = tempCanvas.getObjects() as PlaceholderObject[]

  const imageReplacements: { obj: PlaceholderObject; idx: number; urls: string[] }[] = []

  for (const obj of objects) {
    if (shouldCancel?.()) {
      tempCanvas.dispose()
      return null
    }

    if (!obj.binding) continue
    const { fieldId } = obj.binding

    if (obj.placeholderType === 'text') {
      const text = await getter.getCellText(fieldId, recordId)
      if (shouldCancel?.()) {
        tempCanvas.dispose()
        return null
      }
      const textObj = obj as unknown as TextboxWithBounds
      fitTextboxText(textObj, {
        text: text || ' ',
        maxFontSize: Math.round(textObj.fontSize ?? 36),
      })
    }

    if (obj.placeholderType === 'image') {
      const urls = await getter.getAttachmentUrls(fieldId, recordId)
      if (shouldCancel?.()) {
        tempCanvas.dispose()
        return null
      }
      if (urls.length > 0) {
        const idx = tempCanvas.getObjects().indexOf(obj)
        imageReplacements.push({ obj, idx, urls })
      }
    }

    if (obj.placeholderType === 'qrcode') {
      const text = await getter.getCellText(fieldId, recordId)
      if (shouldCancel?.()) {
        tempCanvas.dispose()
        return null
      }
      if (text) {
        try {
          const size = Math.max(obj.getScaledWidth(), obj.getScaledHeight(), 200)
          const qrDataUrl = await generateQrDataUrl(text, Math.round(size))
          if (shouldCancel?.()) {
            tempCanvas.dispose()
            return null
          }
          const idx = tempCanvas.getObjects().indexOf(obj)
          imageReplacements.push({ obj, idx, urls: [qrDataUrl] })
        } catch (err) {
          console.error('Failed to generate QR code for record', recordId, err)
        }
      }
    }
  }

  for (let i = imageReplacements.length - 1; i >= 0; i--) {
    if (shouldCancel?.()) {
      tempCanvas.dispose()
      return null
    }

    const { obj, idx, urls } = imageReplacements[i]
    try {
      const img = await fabric.FabricImage.fromURL(urls[0], { crossOrigin: 'anonymous' })
      if (shouldCancel?.()) {
        tempCanvas.dispose()
        return null
      }

      const targetWidth = Math.max(1, obj.getScaledWidth())
      const targetHeight = Math.max(1, obj.getScaledHeight())
      const center = obj.getCenterPoint()

      const result = fitImageToTarget({
        imgWidth: img.width!,
        imgHeight: img.height!,
        targetWidth,
        targetHeight,
        centerX: center.x,
        centerY: center.y,
        angle: obj.angle ?? 0,
        shape: obj.placeholderShape ?? 'rect',
        fit: obj.placeholderFit ?? 'cover',
      })

      img.set(result)

      tempCanvas.remove(obj)
      tempCanvas.insertAt(idx, img)
    } catch (err) {
      console.error('Failed to load image for record', recordId, err)
    }
  }

  tempCanvas.renderAll()

  const dataUrl = tempCanvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier,
  })

  tempCanvas.dispose()

  return dataUrlToBlob(dataUrl)
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i)
  }
  return new Blob([arr], { type: mime })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
