import * as fabric from 'fabric'
import type { PlaceholderObject } from '../types/canvas'

export interface ImageFitParams {
  imgWidth: number
  imgHeight: number
  targetWidth: number
  targetHeight: number
  centerX: number
  centerY: number
  angle?: number
  shape: 'rect' | 'circle'
  fit: 'cover' | 'contain'
}

export interface ImageFitResult {
  left: number
  top: number
  scaleX: number
  scaleY: number
  angle: number
  originX?: 'center'
  originY?: 'center'
  cropX?: number
  cropY?: number
  width?: number
  height?: number
  clipPath?: fabric.Circle
}

export function fitImageToTarget(params: ImageFitParams): ImageFitResult {
  const {
    imgWidth,
    imgHeight,
    targetWidth,
    targetHeight,
    centerX,
    centerY,
    angle = 0,
    shape,
    fit,
  } = params

  if (shape === 'circle') {
    const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight)
    const r = Math.min(targetWidth, targetHeight) / 2
    return {
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center',
      angle,
      scaleX: scale,
      scaleY: scale,
      cropX: 0,
      cropY: 0,
      width: imgWidth,
      height: imgHeight,
      clipPath: new fabric.Circle({
        radius: r / scale,
        originX: 'center',
        originY: 'center',
      }),
    }
  }

  const left = centerX - targetWidth / 2
  const top = centerY - targetHeight / 2

  if (fit === 'contain') {
    const scale = Math.min(targetWidth / imgWidth, targetHeight / imgHeight)
    return {
      left: left + (targetWidth - imgWidth * scale) / 2,
      top: top + (targetHeight - imgHeight * scale) / 2,
      angle,
      scaleX: scale,
      scaleY: scale,
      cropX: 0,
      cropY: 0,
      width: imgWidth,
      height: imgHeight,
    }
  }

  // cover
  const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight)
  const cropX = (imgWidth * scale - targetWidth) / 2 / scale
  const cropY = (imgHeight * scale - targetHeight) / 2 / scale
  return {
    left,
    top,
    angle,
    scaleX: scale,
    scaleY: scale,
    cropX,
    cropY,
    width: imgWidth - cropX * 2,
    height: imgHeight - cropY * 2,
  }
}

export function repositionOverlay(
  placeholder: PlaceholderObject,
  entry: { img: fabric.FabricImage; imgNaturalW: number; imgNaturalH: number },
): void {
  const { img, imgNaturalW, imgNaturalH } = entry
  const targetWidth = Math.max(1, placeholder.getScaledWidth())
  const targetHeight = Math.max(1, placeholder.getScaledHeight())
  const center = placeholder.getCenterPoint()

  const result = fitImageToTarget({
    imgWidth: imgNaturalW,
    imgHeight: imgNaturalH,
    targetWidth,
    targetHeight,
    centerX: center.x,
    centerY: center.y,
    angle: placeholder.angle ?? 0,
    shape: placeholder.placeholderShape ?? 'rect',
    fit: placeholder.placeholderFit ?? 'contain',
  })

  img.set(result)
  img.setCoords()
}
