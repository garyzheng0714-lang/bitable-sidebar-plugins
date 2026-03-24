import * as fabric from 'fabric'
import type { PlaceholderObject } from '../types/canvas'
import { applyLockState } from './placeholderLock'
import { getTextboxBounds, type TextboxWithBounds } from './textLayout'

export async function loadWithReviver(
  canvas: fabric.Canvas | fabric.StaticCanvas,
  json: string,
): Promise<void> {
  await canvas.loadFromJSON(json, (_serialized: any, instance: any) => {
    if (_serialized.placeholderId) {
      ;(instance as PlaceholderObject).placeholderId = _serialized.placeholderId
      ;(instance as PlaceholderObject).placeholderType = _serialized.placeholderType
      ;(instance as PlaceholderObject).placeholderLabel = _serialized.placeholderLabel
      ;(instance as PlaceholderObject).placeholderShape =
        _serialized.placeholderShape ?? (_serialized.placeholderType === 'image' ? 'rect' : undefined)
      ;(instance as PlaceholderObject).placeholderFit =
        _serialized.placeholderFit ?? (_serialized.placeholderType === 'image' ? 'cover' : undefined)
      ;(instance as PlaceholderObject).placeholderBoxHeight = _serialized.placeholderBoxHeight
      ;(instance as PlaceholderObject).placeholderFontSizeMax = _serialized.placeholderFontSizeMax
      ;(instance as PlaceholderObject).binding = _serialized.binding ?? null
      if (_serialized.placeholderLocked) {
        ;(instance as PlaceholderObject).placeholderLocked = true
        instance.set(applyLockState(true))
      }
    }
    if (_serialized._isBg) {
      ;(instance as any)._isBg = true
      instance.set({ selectable: false, evented: false })
    }
  })
}

export function serializeCanvas(canvas: fabric.Canvas): string {
  const canvasData = canvas.toJSON()

  const zoom = canvas.getZoom()
  if (zoom !== 1) {
    canvasData.width = Math.round(canvas.width / zoom)
    canvasData.height = Math.round(canvas.height / zoom)
  }

  const objects = canvas.getObjects()
  if (canvasData.objects) {
    canvasData.objects.forEach((objData: any, i: number) => {
      const obj = objects[i] as PlaceholderObject
      if (obj) {
        objData.placeholderId = obj.placeholderId
        objData.placeholderType = obj.placeholderType
        objData.placeholderLabel = obj.placeholderLabel
        objData.placeholderShape = obj.placeholderShape
        objData.placeholderFit = obj.placeholderFit
        objData.placeholderBoxHeight = obj.placeholderBoxHeight
        objData.placeholderFontSizeMax = obj.placeholderFontSizeMax
        objData.binding = obj.binding
        objData.placeholderLocked = obj.placeholderLocked
        if ((obj as any)._isBg) objData._isBg = true
      }
    })
  }
  return JSON.stringify(canvasData)
}

export function drawTextPlaceholderGuide(
  ctx: CanvasRenderingContext2D,
  canvas: fabric.Canvas,
  placeholder: PlaceholderObject,
  isActive: boolean,
): void {
  if (placeholder.placeholderType !== 'text') return

  const textObj = placeholder as unknown as TextboxWithBounds
  const { width, height } = getTextboxBounds(textObj)
  const zoom = canvas.getZoom() || 1
  const rect = textObj.getBoundingRect()
  const angle = ((textObj.angle ?? 0) * Math.PI) / 180
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.roundRect(-((width * zoom) / 2), -((height * zoom) / 2), width * zoom, height * zoom, 10)
  ctx.fillStyle = isActive ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.13)'
  ctx.strokeStyle = isActive ? 'rgba(37, 99, 235, 0.85)' : 'rgba(37, 99, 235, 0.55)'
  ctx.lineWidth = isActive ? 1.4 : 1
  ctx.setLineDash(isActive ? [6, 4] : [4, 5])
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}
