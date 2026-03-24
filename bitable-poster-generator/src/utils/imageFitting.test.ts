import { describe, it, expect } from 'vitest'
import { fitImageToTarget } from './imageFitting'

describe('fitImageToTarget', () => {
  const baseParams = {
    imgWidth: 400,
    imgHeight: 300,
    targetWidth: 200,
    targetHeight: 200,
    centerX: 100,
    centerY: 100,
    angle: 0,
  }

  describe('rect + contain', () => {
    it('scales image to fit within target without cropping', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'rect',
        fit: 'contain',
      })

      // 400x300 into 200x200: scale = min(200/400, 200/300) = 0.5
      expect(result.scaleX).toBe(0.5)
      expect(result.scaleY).toBe(0.5)
      // No crop
      expect(result.cropX).toBe(0)
      expect(result.cropY).toBe(0)
      // Full natural dimensions preserved
      expect(result.width).toBe(400)
      expect(result.height).toBe(300)
    })

    it('centers image within target area', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'rect',
        fit: 'contain',
      })

      // target left = 100 - 200/2 = 0, top = 100 - 200/2 = 0
      // image width at scale = 400*0.5 = 200, height = 300*0.5 = 150
      // centering offset: left += (200-200)/2 = 0, top += (200-150)/2 = 25
      expect(result.left).toBe(0)
      expect(result.top).toBe(25)
    })

    it('does not set originX/originY for rect', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'rect',
        fit: 'contain',
      })

      expect(result.originX).toBeUndefined()
      expect(result.originY).toBeUndefined()
    })

    it('preserves angle', () => {
      const result = fitImageToTarget({
        ...baseParams,
        angle: 45,
        shape: 'rect',
        fit: 'contain',
      })

      expect(result.angle).toBe(45)
    })
  })

  describe('rect + cover', () => {
    it('scales image to fill target completely with crop', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'rect',
        fit: 'cover',
      })

      // 400x300 into 200x200: scale = max(200/400, 200/300) = 0.667
      expect(result.scaleX).toBeCloseTo(2 / 3)
      expect(result.scaleY).toBeCloseTo(2 / 3)
    })

    it('crops excess to center the image', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'rect',
        fit: 'cover',
      })

      // scale = 2/3, scaledW = 400*2/3 = 266.67
      // cropX = (266.67 - 200) / 2 / (2/3) = 50
      expect(result.cropX).toBeCloseTo(50)
      // scaledH = 300*2/3 = 200, no vertical crop
      expect(result.cropY).toBeCloseTo(0)
      // width = 400 - 50*2 = 300
      expect(result.width).toBeCloseTo(300)
      expect(result.height).toBeCloseTo(300)
    })

    it('positions at top-left of target', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'rect',
        fit: 'cover',
      })

      // left = centerX - targetW/2 = 100 - 100 = 0
      expect(result.left).toBe(0)
      expect(result.top).toBe(0)
    })
  })

  describe('circle', () => {
    it('uses center origin', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'circle',
        fit: 'cover',
      })

      expect(result.originX).toBe('center')
      expect(result.originY).toBe('center')
    })

    it('positions at center point', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'circle',
        fit: 'cover',
      })

      expect(result.left).toBe(100)
      expect(result.top).toBe(100)
    })

    it('scales to cover and creates clipPath', () => {
      const result = fitImageToTarget({
        ...baseParams,
        shape: 'circle',
        fit: 'cover',
      })

      // scale = max(200/400, 200/300) = 2/3
      expect(result.scaleX).toBeCloseTo(2 / 3)
      expect(result.scaleY).toBeCloseTo(2 / 3)
      // No crop — circle uses clipPath instead
      expect(result.cropX).toBe(0)
      expect(result.cropY).toBe(0)
      // Full natural dimensions
      expect(result.width).toBe(400)
      expect(result.height).toBe(300)
      // clipPath exists
      expect(result.clipPath).toBeDefined()
    })

    it('clipPath radius accounts for scale', () => {
      const result = fitImageToTarget({
        imgWidth: 400,
        imgHeight: 400,
        targetWidth: 200,
        targetHeight: 200,
        centerX: 100,
        centerY: 100,
        angle: 0,
        shape: 'circle',
        fit: 'cover',
      })

      // r = min(200,200)/2 = 100, scale = 200/400 = 0.5
      // clipPath radius = 100 / 0.5 = 200
      expect(result.clipPath).toBeDefined()
      expect((result.clipPath as any).radius).toBe(200)
    })
  })

  describe('edge cases', () => {
    it('handles square image into square target', () => {
      const result = fitImageToTarget({
        imgWidth: 100,
        imgHeight: 100,
        targetWidth: 100,
        targetHeight: 100,
        centerX: 50,
        centerY: 50,
        angle: 0,
        shape: 'rect',
        fit: 'contain',
      })

      expect(result.scaleX).toBe(1)
      expect(result.scaleY).toBe(1)
    })

    it('defaults angle to 0 when not provided', () => {
      const result = fitImageToTarget({
        imgWidth: 100,
        imgHeight: 100,
        targetWidth: 100,
        targetHeight: 100,
        centerX: 50,
        centerY: 50,
        shape: 'rect',
        fit: 'contain',
      })

      expect(result.angle).toBe(0)
    })
  })
})
