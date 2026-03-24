import { useCallback, useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import { setupGuidelines } from '../utils/guidelines'
import { repositionOverlay } from '../utils/imageFitting'
import { loadWithReviver, serializeCanvas, drawTextPlaceholderGuide } from '../utils/canvasIO'
import { useCanvasPreview } from './useCanvasPreview'
import type { PlaceholderBinding } from '../types'
import type { PlaceholderObject } from '../types/canvas'
import { applyLockState, isLocked } from '../utils/placeholderLock'
import {
  fitTextboxText,
  type TextboxWithBounds,
} from '../utils/textLayout'

// Re-export for backward compatibility
export type { PlaceholderObject } from '../types/canvas'
export { loadWithReviver } from '../utils/canvasIO'

const CANVAS_DEFAULT_W = 800
const CANVAS_DEFAULT_H = 1200
const CONTAINER_PADDING = 24

export function useCanvas(containerRef: React.RefObject<HTMLDivElement | null>) {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [activeObject, setActiveObject] = useState<PlaceholderObject | null>(null)
  const [, bumpActiveObjectVersion] = useState(0)
  const [placeholders, setPlaceholders] = useState<PlaceholderObject[]>([])
  const [templateSize, setTemplateSize] = useState({ width: CANVAS_DEFAULT_W, height: CANVAS_DEFAULT_H })
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const skipSaveRef = useRef(false)

  const { previewRef, overlayUiVisibleRef, clearPreview, previewRecord } =
    useCanvasPreview(canvasRef, skipSaveRef)

  const refreshPlaceholders = useCallback(() => {
    const c = canvasRef.current
    if (!c) {
      setPlaceholders([])
      return
    }
    const list = c.getObjects().filter(
      (o: any) => o.placeholderType === 'text' || o.placeholderType === 'image' || o.placeholderType === 'qrcode',
    ) as PlaceholderObject[]
    setPlaceholders(list)
  }, [])

  const saveHistory = useCallback((c: fabric.Canvas) => {
    if (skipSaveRef.current) return
    const json = serializeCanvas(c)
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(json)
    historyIndexRef.current = historyRef.current.length - 1
  }, [])

  const syncActiveObject = useCallback((next: PlaceholderObject | null) => {
    setActiveObject(next)
    bumpActiveObjectVersion((v) => v + 1)
  }, [])

  // initialize canvas
  const initCanvas = useCallback(async (canvasEl: HTMLCanvasElement) => {
    if (canvasRef.current) {
      await canvasRef.current.dispose()
    }

    const c = new fabric.Canvas(canvasEl, {
      width: CANVAS_DEFAULT_W,
      height: CANVAS_DEFAULT_H,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    })

    Object.assign(fabric.InteractiveFabricObject.ownDefaults, {
      borderColor: 'rgba(0, 0, 0, 0.4)',
      borderScaleFactor: 1,
      borderDashArray: [4, 4],
      cornerColor: '#ffffff',
      cornerStrokeColor: 'rgba(0, 0, 0, 0.5)',
      cornerSize: 10,
      cornerStyle: 'circle',
      transparentCorners: false,
      padding: 2,
      snapAngle: 45,
      snapThreshold: 5,
    })

    setupGuidelines(c)

    // --- Interaction indicators (position, size, rotation) ---
    let interactionMode: 'none' | 'moving' | 'scaling' | 'rotating' = 'none'
    let indicatorTarget: fabric.FabricObject | null = null
    let indicatorData = { x: 0, y: 0, w: 0, h: 0, angle: 0 }

    c.on('object:moving', (e) => {
      if (!e.target) return
      interactionMode = 'moving'
      indicatorTarget = e.target
      indicatorData.x = Math.round(e.target.left ?? 0)
      indicatorData.y = Math.round(e.target.top ?? 0)
      const ph = e.target as PlaceholderObject
      if (ph.placeholderId && previewRef.current?.overlayMap) {
        const entry = previewRef.current.overlayMap.get(ph.placeholderId)
        if (entry) repositionOverlay(ph, entry)
      }
    })

    c.on('object:scaling', (e) => {
      if (!e.target) return
      interactionMode = 'scaling'
      indicatorTarget = e.target
      indicatorData.w = Math.round((e.target.width ?? 0) * (e.target.scaleX ?? 1))
      indicatorData.h = Math.round((e.target.height ?? 0) * (e.target.scaleY ?? 1))
      const ph = e.target as PlaceholderObject
      if (ph.placeholderId && previewRef.current?.overlayMap) {
        const entry = previewRef.current.overlayMap.get(ph.placeholderId)
        if (entry) repositionOverlay(ph, entry)
      }
    })

    c.on('object:rotating', (e) => {
      if (!e.target) return
      interactionMode = 'rotating'
      indicatorTarget = e.target
      indicatorData.angle = Math.round(e.target.angle ?? 0)
      const ph = e.target as PlaceholderObject
      if (ph.placeholderId && previewRef.current?.overlayMap) {
        const entry = previewRef.current.overlayMap.get(ph.placeholderId)
        if (entry) repositionOverlay(ph, entry)
      }
    })

    const clearInteractionState = () => {
      if (interactionMode !== 'none') {
        interactionMode = 'none'
        indicatorTarget = null
        c.requestRenderAll()
      }
    }
    c.on('mouse:up', clearInteractionState)

    c.on('after:render', () => {
      if (!overlayUiVisibleRef.current) return

      const ctx = c.getContext()
      const active = c.getActiveObject() as PlaceholderObject | null
      for (const obj of c.getObjects() as PlaceholderObject[]) {
        if (obj.placeholderType === 'text') {
          if ((obj as fabric.Textbox).isEditing) continue
          drawTextPlaceholderGuide(ctx, c, obj, active?.placeholderId === obj.placeholderId)
        }
      }

      if (interactionMode === 'none' || !indicatorTarget) return
      const bound = indicatorTarget.getBoundingRect()

      let label = ''
      if (interactionMode === 'moving') {
        label = `X: ${indicatorData.x}  Y: ${indicatorData.y}`
      } else if (interactionMode === 'scaling') {
        label = `${indicatorData.w} × ${indicatorData.h}`
      } else if (interactionMode === 'rotating') {
        label = `${indicatorData.angle}°`
      }

      ctx.save()
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      const metrics = ctx.measureText(label)
      const pw = 8
      const bw = metrics.width + pw * 2
      const bh = 22
      const x = bound.left + bound.width / 2
      const y = bound.top - 12

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.beginPath()
      ctx.roundRect(x - bw / 2, y - bh, bw, bh, 4)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, x, y - bh / 2)
      ctx.restore()
    })

    c.on('selection:created', (e) => {
      syncActiveObject((e.selected?.[0] as PlaceholderObject) ?? null)
    })
    c.on('selection:updated', (e) => {
      syncActiveObject((e.selected?.[0] as PlaceholderObject) ?? null)
    })
    c.on('selection:cleared', () => {
      syncActiveObject(null)
    })

    c.on('text:editing:exited', (e) => {
      const target = e.target as PlaceholderObject
      if (!target || target.placeholderType !== 'text') return

      const textObj = target as unknown as TextboxWithBounds
      fitTextboxText(textObj)
      c.renderAll()
      syncActiveObject(target)
      saveHistory(c)
    })

    c.on('text:changed', (e) => {
      const target = e.target as PlaceholderObject
      if (!target || target.placeholderType !== 'text') return

      const textObj = target as unknown as TextboxWithBounds
      const singleLineText = String(textObj.text ?? '').replace(/\r?\n+/g, ' ')
      if (singleLineText !== textObj.text) {
        textObj.set('text', singleLineText)
      }
      fitTextboxText(textObj, { preserveCenter: false })
      c.requestRenderAll()
      syncActiveObject(target)
    })

    c.on('object:modified', (e) => {
      const target = e.target as PlaceholderObject
      let changed = false
      if (target?.placeholderType === 'text') {
        const textObj = target as unknown as TextboxWithBounds
        const sx = textObj.scaleX ?? 1
        const sy = textObj.scaleY ?? 1
        if (sx !== 1 || sy !== 1) {
          const newWidth = Math.max(40, Math.round((textObj.width ?? 240) * sx))
          const nextBoxHeight = Math.max(
            48,
            Math.round((textObj.placeholderBoxHeight ?? textObj.height ?? 48) * sy),
          )
          const nextFontSize = Math.max(
            8,
            Math.round((textObj.placeholderFontSizeMax ?? textObj.fontSize ?? 36) * sy),
          )
          textObj.set({
            placeholderBoxHeight: nextBoxHeight,
            placeholderFontSizeMax: nextFontSize,
          })
          textObj.set({ width: newWidth, scaleX: 1, scaleY: 1 })
          fitTextboxText(textObj, { maxFontSize: nextFontSize })
          changed = true
        }
      }
      if (target?.placeholderType === 'image') {
        const sx = target.scaleX ?? 1
        const sy = target.scaleY ?? 1
        if (sx !== 1 || sy !== 1) {
          if (target.placeholderShape === 'circle' && target instanceof fabric.Circle) {
            const center = target.getCenterPoint()
            const radius = target.radius ?? 0
            const diameter = Math.max(24, radius * 2 * Math.max(sx, sy))
            target.set({ radius: diameter / 2, scaleX: 1, scaleY: 1 })
            target.setPositionByOrigin(center, 'center', 'center')
          } else {
            const width = Math.max(24, (target.width ?? 0) * sx)
            const height = Math.max(24, (target.height ?? 0) * sy)
            target.set({ width, height, scaleX: 1, scaleY: 1 })
          }
          target.setCoords()
          changed = true
        }
      }
      const phMod = target as PlaceholderObject
      if (phMod?.placeholderId && previewRef.current?.overlayMap) {
        const entry = previewRef.current.overlayMap.get(phMod.placeholderId)
        if (entry) {
          repositionOverlay(phMod, entry)
          changed = true
        }
      }
      if (changed) c.renderAll()
      const placeholderTarget = target as PlaceholderObject
      if (placeholderTarget?.placeholderType) {
        syncActiveObject(placeholderTarget)
      }
      saveHistory(c)
    })
    c.on('object:added', () => {
      if (!skipSaveRef.current) saveHistory(c)
      refreshPlaceholders()
    })
    c.on('object:removed', () => {
      if (!skipSaveRef.current) saveHistory(c)
      refreshPlaceholders()
    })

    canvasRef.current = c
    setCanvas(c)
    saveHistory(c)

    return c
  }, [saveHistory, refreshPlaceholders, syncActiveObject, previewRef, overlayUiVisibleRef])

  useEffect(() => {
    return () => {
      canvasRef.current?.dispose()
      canvasRef.current = null
    }
  }, [])

  const fitToContainer = useCallback(() => {
    const c = canvasRef.current
    const container = containerRef.current
    if (!c || !container) return

    const containerWidth = container.clientWidth - CONTAINER_PADDING
    const containerHeight = container.clientHeight - CONTAINER_PADDING
    if (containerWidth <= 0 || containerHeight <= 0) return

    const scaleByWidth = containerWidth / templateSize.width
    const scaleByHeight = containerHeight / templateSize.height
    const scale = Math.min(scaleByWidth, scaleByHeight, 1)

    c.setDimensions({
      width: templateSize.width * scale,
      height: templateSize.height * scale,
    })
    c.setZoom(scale)
  }, [containerRef, templateSize])

  useEffect(() => {
    fitToContainer()
    window.addEventListener('resize', fitToContainer)
    return () => window.removeEventListener('resize', fitToContainer)
  }, [fitToContainer])

  const undo = useCallback(async () => {
    const c = canvasRef.current
    if (!c || historyIndexRef.current <= 0) return
    historyIndexRef.current--
    skipSaveRef.current = true
    await loadWithReviver(c, historyRef.current[historyIndexRef.current])
    c.renderAll()
    skipSaveRef.current = false
    refreshPlaceholders()
  }, [refreshPlaceholders])

  const redo = useCallback(async () => {
    const c = canvasRef.current
    if (!c || historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    skipSaveRef.current = true
    await loadWithReviver(c, historyRef.current[historyIndexRef.current])
    c.renderAll()
    skipSaveRef.current = false
    refreshPlaceholders()
  }, [refreshPlaceholders])

  const setBackgroundImage = useCallback(async (url: string) => {
    const c = canvasRef.current
    if (!c) return

    const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)

    const tmpCanvas = document.createElement('canvas')
    tmpCanvas.width = img.width!
    tmpCanvas.height = img.height!
    const ctx = tmpCanvas.getContext('2d')!
    ctx.drawImage(img.getElement() as HTMLImageElement, 0, 0)
    const dataUrl = tmpCanvas.toDataURL('image/png')
    const imgFromData = await fabric.FabricImage.fromURL(dataUrl)

    const w = imgFromData.width!
    const h = imgFromData.height!
    setTemplateSize({ width: w, height: h })

    c.setDimensions({ width: w, height: h })

    imgFromData.set({
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
      excludeFromExport: false,
    })
    imgFromData.scaleToWidth(w)
    imgFromData.scaleToHeight(h)

    const objs = c.getObjects()
    const bgObj = objs.find((o: any) => o._isBg)
    if (bgObj) c.remove(bgObj)

    ;(imgFromData as any)._isBg = true
    c.insertAt(0, imgFromData)
    c.renderAll()
    fitToContainer()
    saveHistory(c)
  }, [fitToContainer, saveHistory])

  const getPlaceholderOffset = useCallback(() => {
    const c = canvasRef.current
    if (!c) return 0
    return c.getObjects().filter((o: any) => o.placeholderType).length
  }, [])

  const addTextPlaceholder = useCallback((position?: { x: number; y: number }) => {
    const c = canvasRef.current
    if (!c) return

    const offset = getPlaceholderOffset() * 30
    const id = crypto.randomUUID()
    const boxWidth = 240
    const boxHeight = 132
    const centerX = position?.x ?? (templateSize.width / 2 + offset)
    const centerY = position?.y ?? (templateSize.height / 2 + offset)
    const text = new fabric.Textbox('Text', {
      left: centerX,
      top: centerY,
      width: boxWidth,
      fontSize: 36,
      fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
      fill: '#2f261f',
      fontWeight: '700',
      editable: true,
      padding: 8,
      splitByGrapheme: false,
      textAlign: 'center',
    }) as PlaceholderObject

    text.placeholderId = id
    text.placeholderType = 'text'
    text.placeholderLabel = 'Text'
    text.placeholderBoxHeight = boxHeight
    text.placeholderFontSizeMax = 36
    text.binding = null
    ;(text as fabric.Textbox).setPositionByOrigin(new fabric.Point(centerX, centerY), 'center', 'center')
    fitTextboxText(text as unknown as TextboxWithBounds, { maxFontSize: 36 })

    c.add(text)
    c.setActiveObject(text)
    c.renderAll()
  }, [templateSize, getPlaceholderOffset])

  const addImagePlaceholder = useCallback((position?: { x: number; y: number }) => {
    const c = canvasRef.current
    if (!c) return

    const offset = getPlaceholderOffset() * 30
    const id = crypto.randomUUID()
    const w = 200
    const h = 200
    const centerX = position?.x ?? (templateSize.width / 2 + offset)
    const centerY = position?.y ?? (templateSize.height / 2 + offset)

    const rect = new fabric.Rect({
      left: centerX - w / 2,
      top: centerY - h / 2,
      width: w,
      height: h,
      fill: 'rgba(37, 99, 235, 0.16)',
      stroke: 'rgba(37, 99, 235, 0.72)',
      strokeWidth: 1.5,
      rx: 2,
      ry: 2,
      padding: 4,
    }) as unknown as PlaceholderObject

    rect.placeholderId = id
    rect.placeholderType = 'image'
    rect.placeholderLabel = 'Image'
    rect.placeholderShape = 'rect'
    rect.placeholderFit = 'contain'
    rect.binding = null

    c.add(rect)
    c.setActiveObject(rect)
    c.renderAll()
  }, [templateSize, getPlaceholderOffset])

  const addLogoPlaceholder = useCallback((position?: { x: number; y: number }) => {
    const c = canvasRef.current
    if (!c) return

    const offset = getPlaceholderOffset() * 30
    const id = crypto.randomUUID()
    const diameter = 180
    const centerX = position?.x ?? (templateSize.width / 2 + offset)
    const centerY = position?.y ?? (templateSize.height / 2 + offset)

    const circle = new fabric.Circle({
      left: centerX - diameter / 2,
      top: centerY - diameter / 2,
      radius: diameter / 2,
      fill: 'rgba(37, 99, 235, 0.16)',
      stroke: 'rgba(37, 99, 235, 0.72)',
      strokeWidth: 1.5,
      padding: 4,
    }) as unknown as PlaceholderObject

    circle.placeholderId = id
    circle.placeholderType = 'image'
    circle.placeholderLabel = 'Logo'
    circle.placeholderShape = 'circle'
    circle.placeholderFit = 'cover'
    circle.binding = null

    c.add(circle)
    c.setActiveObject(circle)
    c.renderAll()
  }, [templateSize, getPlaceholderOffset])

  const addQrCodePlaceholder = useCallback((position?: { x: number; y: number }) => {
    const c = canvasRef.current
    if (!c) return

    const offset = getPlaceholderOffset() * 30
    const id = crypto.randomUUID()
    const size = 160
    const centerX = position?.x ?? (templateSize.width / 2 + offset)
    const centerY = position?.y ?? (templateSize.height / 2 + offset)

    const rect = new fabric.Rect({
      left: centerX - size / 2,
      top: centerY - size / 2,
      width: size,
      height: size,
      fill: 'rgba(37, 99, 235, 0.10)',
      stroke: 'rgba(37, 99, 235, 0.72)',
      strokeWidth: 1.5,
      strokeDashArray: [6, 4],
      rx: 4,
      ry: 4,
      padding: 4,
    }) as unknown as PlaceholderObject

    rect.placeholderId = id
    rect.placeholderType = 'qrcode'
    rect.placeholderLabel = 'QR Code'
    rect.placeholderShape = 'rect'
    rect.placeholderFit = 'contain'
    rect.binding = null

    c.add(rect)
    c.setActiveObject(rect)
    c.renderAll()
  }, [templateSize, getPlaceholderOffset])

  const bindField = useCallback((binding: PlaceholderBinding | null, target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj) return

    obj.set('binding', binding)
    if (binding && obj.placeholderType === 'text') {
      const textObj = obj as unknown as TextboxWithBounds
      textObj.set('text', `{{${binding.fieldName}}}`)
      fitTextboxText(textObj)
    }
    if (binding && (obj.placeholderType === 'image' || obj.placeholderType === 'qrcode')) {
      obj.set('placeholderLabel', binding.fieldName)
    }

    c.renderAll()
    syncActiveObject(obj)
    refreshPlaceholders()
    saveHistory(c)
  }, [activeObject, refreshPlaceholders, saveHistory, syncActiveObject])

  const updateTextFontSize = useCallback((fontSize: number, target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || obj.placeholderType !== 'text') return

    const size = Math.max(8, Math.round(fontSize))
    const textObj = obj as unknown as TextboxWithBounds
    textObj.set('placeholderFontSizeMax', size)
    textObj.set({ scaleX: 1, scaleY: 1 })
    fitTextboxText(textObj, { maxFontSize: size })
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, saveHistory, syncActiveObject])

  const updateTextBoxWidth = useCallback((width: number, target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || obj.placeholderType !== 'text') return

    const w = Math.max(40, Math.round(width))
    const textObj = obj as unknown as TextboxWithBounds
    textObj.set({ width: w, scaleX: 1, scaleY: 1 })
    fitTextboxText(textObj)
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, saveHistory, syncActiveObject])

  const updateTextBoxHeight = useCallback((height: number, target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || obj.placeholderType !== 'text') return

    const textObj = obj as unknown as TextboxWithBounds
    textObj.set('placeholderBoxHeight', Math.max(48, Math.round(height)))
    fitTextboxText(textObj)
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, saveHistory, syncActiveObject])

  const updateTextAlign = useCallback((align: 'left' | 'center' | 'right', target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || obj.placeholderType !== 'text') return

    const textObj = obj as unknown as TextboxWithBounds
    textObj.set({ textAlign: align })
    fitTextboxText(textObj)
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, saveHistory, syncActiveObject])

  const updateTextFontWeight = useCallback((weight: string, target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || obj.placeholderType !== 'text') return

    const textObj = obj as unknown as TextboxWithBounds
    textObj.set({ fontWeight: weight })
    fitTextboxText(textObj)
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, saveHistory, syncActiveObject])

  const updateImageSize = useCallback(
    (
      next: { width?: number; height?: number; diameter?: number },
      target?: PlaceholderObject,
    ) => {
      const c = canvasRef.current
      const obj = target ?? activeObject
      if (!c || !obj || obj.placeholderType !== 'image') return

      const center = obj.getCenterPoint()

      if (obj.placeholderShape === 'circle' && obj instanceof fabric.Circle) {
        const diameter = Math.max(24, Math.round(next.diameter ?? 0))
        obj.set({ radius: diameter / 2, scaleX: 1, scaleY: 1 })
      } else {
        const width = Math.max(24, Math.round(next.width ?? (obj.width ?? 0)))
        const height = Math.max(24, Math.round(next.height ?? (obj.height ?? 0)))
        obj.set({ width, height, scaleX: 1, scaleY: 1 })
      }

      obj.setPositionByOrigin(center, 'center', 'center')
      obj.setCoords()
      const ph = obj as PlaceholderObject
      if (ph.placeholderId && previewRef.current?.overlayMap) {
        const entry = previewRef.current.overlayMap.get(ph.placeholderId)
        if (entry) repositionOverlay(ph, entry)
      }
      c.renderAll()
      syncActiveObject(obj)
      saveHistory(c)
    },
    [activeObject, saveHistory, syncActiveObject, previewRef],
  )

  const updateObjectTransform = useCallback(
    (next: { left?: number; top?: number; angle?: number }, target?: PlaceholderObject) => {
      const c = canvasRef.current
      const obj = target ?? activeObject
      if (!c || !obj || !obj.placeholderType) return

      const left = Math.round(next.left ?? (obj.left ?? 0))
      const top = Math.round(next.top ?? (obj.top ?? 0))
      const angle = Math.round(next.angle ?? (obj.angle ?? 0))

      obj.set({ left, top, angle })
      obj.setCoords()
      if (obj.placeholderId && previewRef.current?.overlayMap) {
        const entry = previewRef.current.overlayMap.get(obj.placeholderId)
        if (entry) repositionOverlay(obj, entry)
      }
      c.renderAll()
      syncActiveObject(obj)
      saveHistory(c)
    },
    [activeObject, saveHistory, syncActiveObject, previewRef],
  )

  const updateImageFit = useCallback(
    (fit: 'cover' | 'contain', target?: PlaceholderObject) => {
      const c = canvasRef.current
      const obj = target ?? (c?.getActiveObject() as PlaceholderObject | null)
      if (!c || !obj || obj.placeholderType !== 'image') return

      obj.set('placeholderFit', fit)
      if (obj.placeholderId && previewRef.current?.overlayMap) {
        const entry = previewRef.current.overlayMap.get(obj.placeholderId)
        if (entry) repositionOverlay(obj, entry)
      }
      c.renderAll()
      syncActiveObject(obj)
      refreshPlaceholders()
      saveHistory(c)
    },
    [refreshPlaceholders, saveHistory, syncActiveObject, previewRef],
  )

  const updateTextColor = useCallback((color: string, target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || obj.placeholderType !== 'text') return
    const textObj = obj as unknown as TextboxWithBounds
    textObj.set({ fill: color })
    fitTextboxText(textObj)
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, saveHistory, syncActiveObject])

  const updateTextFontFamily = useCallback((family: string, target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || obj.placeholderType !== 'text') return
    const textObj = obj as unknown as TextboxWithBounds
    textObj.set({ fontFamily: family })
    fitTextboxText(textObj)
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, saveHistory, syncActiveObject])

  const toggleLock = useCallback((target?: PlaceholderObject) => {
    const c = canvasRef.current
    const obj = target ?? activeObject
    if (!c || !obj || !obj.placeholderType) return

    const nextLocked = !isLocked(obj)
    obj.set(applyLockState(nextLocked))
    c.renderAll()
    syncActiveObject(obj)
    saveHistory(c)
  }, [activeObject, syncActiveObject, saveHistory])

  const deleteActive = useCallback(() => {
    const c = canvasRef.current
    if (!c || !activeObject) return

    if (!c.getObjects().includes(activeObject)) {
      c.discardActiveObject()
      syncActiveObject(null)
      return
    }

    if (previewRef.current) {
      clearPreview({ skipRender: true })
    }

    c.remove(activeObject)
    c.discardActiveObject()
    c.renderAll()
    syncActiveObject(null)
  }, [activeObject, syncActiveObject, clearPreview, previewRef])

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      const c = canvasRef.current
      if (c) {
        const active = c.getActiveObject()
        if (active && (active as any).isEditing) return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteActive()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteActive])

  const exportAsDataUrl = useCallback((multiplier = 2): string | null => {
    const c = canvasRef.current
    if (!c) return null
    if (previewRef.current) clearPreview()
    overlayUiVisibleRef.current = false
    c.renderAll()
    const dataUrl = c.toDataURL({ format: 'png', quality: 1, multiplier })
    overlayUiVisibleRef.current = true
    c.renderAll()
    return dataUrl
  }, [clearPreview, previewRef, overlayUiVisibleRef])

  const getCanvasJson = useCallback((): string => {
    const c = canvasRef.current
    if (!c) return '{}'
    if (previewRef.current) clearPreview()
    return serializeCanvas(c)
  }, [clearPreview, previewRef])

  const loadCanvasJson = useCallback(async (json: string) => {
    const c = canvasRef.current
    if (!c) return

    try {
      const parsed = JSON.parse(json)
      const nextWidth = Number(parsed.width) || CANVAS_DEFAULT_W
      const nextHeight = Number(parsed.height) || CANVAS_DEFAULT_H
      setTemplateSize({ width: nextWidth, height: nextHeight })
      c.setDimensions({ width: nextWidth, height: nextHeight })
    } catch {
      // ignore parse error and continue load
    }

    skipSaveRef.current = true
    await loadWithReviver(c, json)
    c.renderAll()
    fitToContainer()
    skipSaveRef.current = false
    refreshPlaceholders()
    saveHistory(c)
  }, [fitToContainer, refreshPlaceholders, saveHistory])

  return {
    canvasRef,
    canvas,
    activeObject,
    placeholders,
    templateSize,
    initCanvas,
    fitToContainer,
    setBackgroundImage,
    addTextPlaceholder,
    addImagePlaceholder,
    addLogoPlaceholder,
    addQrCodePlaceholder,
    bindField,
    updateTextFontSize,
    updateTextBoxWidth,
    updateTextBoxHeight,
    updateTextAlign,
    updateTextFontWeight,
    updateImageSize,
    updateObjectTransform,
    updateImageFit,
    updateTextColor,
    updateTextFontFamily,
    toggleLock,
    deleteActive,
    refreshPlaceholders,
    exportAsDataUrl,
    getCanvasJson,
    loadCanvasJson,
    previewRecord,
    clearPreview,
    undo,
    redo,
  }
}
