import { useCallback, useRef } from 'react'
import * as fabric from 'fabric'
import type { PlaceholderObject } from '../types/canvas'
import { fitImageToTarget } from '../utils/imageFitting'
import { generateQrDataUrl } from '../utils/qrcode'
import {
  fitTextboxText,
  type TextboxWithBounds,
} from '../utils/textLayout'

export interface PreviewState {
  textOriginals: Map<string, string>
  fontSizeOriginals: Map<string, number>
  imageOverlays: fabric.FabricObject[]
  overlayMap: Map<string, { img: fabric.FabricImage; imgNaturalW: number; imgNaturalH: number }>
}

export function useCanvasPreview(
  canvasRef: React.MutableRefObject<fabric.Canvas | null>,
  skipSaveRef: React.MutableRefObject<boolean>,
) {
  const previewRef = useRef<PreviewState | null>(null)
  const previewGenRef = useRef(0)
  const overlayUiVisibleRef = useRef(true)

  const clearPreview = useCallback((options?: { skipRender?: boolean }) => {
    const c = canvasRef.current
    const preview = previewRef.current
    if (!c || !preview) return

    const prevRender = c.renderOnAddRemove
    c.renderOnAddRemove = false
    skipSaveRef.current = true

    const objects = c.getObjects() as PlaceholderObject[]
    for (const obj of objects) {
      if (obj.placeholderType === 'text' && obj.placeholderId) {
        const textObj = obj as unknown as TextboxWithBounds
        if (preview.textOriginals.has(obj.placeholderId)) {
          textObj.set('text', preview.textOriginals.get(obj.placeholderId)!)
        }
        fitTextboxText(textObj, {
          maxFontSize: preview.fontSizeOriginals.get(obj.placeholderId) ?? Math.round(textObj.fontSize ?? 36),
        })
      }
    }

    for (const overlay of preview.imageOverlays) {
      c.remove(overlay)
    }

    previewRef.current = null
    skipSaveRef.current = false
    c.renderOnAddRemove = prevRender
    if (!options?.skipRender) c.renderAll()
  }, [canvasRef, skipSaveRef])

  const previewRecord = useCallback(async (
    recordId: string,
    getter: {
      getCellText: (fieldId: string, recordId: string) => Promise<string>
      getAttachmentUrls: (fieldId: string, recordId: string) => Promise<string[]>
    },
  ) => {
    const c = canvasRef.current
    if (!c) return

    const gen = ++previewGenRef.current
    const stale = () => previewGenRef.current !== gen

    // Phase 1: fetch all data without touching the canvas
    const objects = c.getObjects() as PlaceholderObject[]
    const textData: { obj: PlaceholderObject; text: string }[] = []
    const imageData: { obj: PlaceholderObject; img: fabric.FabricImage }[] = []

    for (const obj of objects) {
      if (stale()) return
      if (!obj.binding || !obj.placeholderId) continue
      const { fieldId } = obj.binding

      if (obj.placeholderType === 'text') {
        try {
          const text = await getter.getCellText(fieldId, recordId)
          if (stale()) return
          textData.push({ obj, text })
        } catch { /* ignore */ }
      }

      if (obj.placeholderType === 'image') {
        try {
          const urls = await getter.getAttachmentUrls(fieldId, recordId)
          if (stale()) return
          if (urls.length > 0) {
            const img = await fabric.FabricImage.fromURL(urls[0], { crossOrigin: 'anonymous' })
            if (stale()) return
            imageData.push({ obj, img })
          }
        } catch { /* ignore */ }
      }

      if (obj.placeholderType === 'qrcode') {
        try {
          const text = await getter.getCellText(fieldId, recordId)
          if (stale()) return
          if (text) {
            const size = Math.max(obj.getScaledWidth(), obj.getScaledHeight(), 200)
            const qrDataUrl = await generateQrDataUrl(text, Math.round(size))
            if (stale()) return
            const img = await fabric.FabricImage.fromURL(qrDataUrl)
            if (stale()) return
            imageData.push({ obj, img })
          }
        } catch { /* ignore */ }
      }
    }

    if (stale()) return

    // Phase 2: atomic canvas swap (synchronous, no awaits)
    const prevRender = c.renderOnAddRemove
    c.renderOnAddRemove = false
    skipSaveRef.current = true

    clearPreview({ skipRender: true })

    const textOriginals = new Map<string, string>()
    const fontSizeOriginals = new Map<string, number>()
    const imageOverlays: fabric.FabricObject[] = []
    const overlayMap = new Map<string, { img: fabric.FabricImage; imgNaturalW: number; imgNaturalH: number }>()

    const currentObjects = new Set(c.getObjects())
    for (const { obj, text } of textData) {
      if (!currentObjects.has(obj)) continue
      const textObj = obj as unknown as TextboxWithBounds
      textOriginals.set(obj.placeholderId!, textObj.text)
      fontSizeOriginals.set(
        obj.placeholderId!,
        textObj.placeholderFontSizeMax ?? textObj.fontSize ?? 36,
      )
      fitTextboxText(textObj, {
        text: text || ' ',
        maxFontSize: fontSizeOriginals.get(obj.placeholderId!) ?? 36,
      })
    }

    for (const { obj, img } of imageData) {
      if (!currentObjects.has(obj)) continue
      const targetWidth = Math.max(1, obj.getScaledWidth())
      const targetHeight = Math.max(1, obj.getScaledHeight())
      const center = obj.getCenterPoint()

      // Capture natural dimensions BEFORE img.set() — cover mode changes width/height
      const imgNaturalW = img.width!
      const imgNaturalH = img.height!

      const result = fitImageToTarget({
        imgWidth: imgNaturalW,
        imgHeight: imgNaturalH,
        targetWidth,
        targetHeight,
        centerX: center.x,
        centerY: center.y,
        angle: obj.angle ?? 0,
        shape: obj.placeholderShape ?? 'rect',
        fit: obj.placeholderFit ?? 'contain',
      })

      img.set(result)
      ;(img as any)._isPreview = true
      img.set({ selectable: false, evented: false })

      const idx = c.getObjects().indexOf(obj)
      c.insertAt(idx + 1, img)
      imageOverlays.push(img)
      overlayMap.set(obj.placeholderId!, { img, imgNaturalW, imgNaturalH })
    }

    previewRef.current = { textOriginals, fontSizeOriginals, imageOverlays, overlayMap }
    skipSaveRef.current = false
    c.renderOnAddRemove = prevRender
    c.renderAll()
  }, [canvasRef, skipSaveRef, clearPreview])

  return {
    previewRef,
    overlayUiVisibleRef,
    clearPreview,
    previewRecord,
  }
}
