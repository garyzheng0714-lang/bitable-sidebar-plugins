import { describe, it, expect } from 'vitest'
import { computeThumbnailDimensions } from './thumbnail'

describe('computeThumbnailDimensions', () => {
  it('scales down a landscape image to fit maxWidth', () => {
    const result = computeThumbnailDimensions(800, 600, 200, 300)

    // scale = min(200/800, 300/600) = 0.25
    expect(result).toEqual({ width: 200, height: 150 })
  })

  it('scales down a portrait image to fit maxHeight', () => {
    const result = computeThumbnailDimensions(600, 1200, 200, 300)

    // scale = min(200/600, 300/1200) = 0.25
    expect(result).toEqual({ width: 150, height: 300 })
  })

  it('does not upscale images smaller than max', () => {
    const result = computeThumbnailDimensions(100, 80, 200, 300)

    // scale = min(200/100, 300/80, 1) = 1
    expect(result).toEqual({ width: 100, height: 80 })
  })

  it('handles square image into square target', () => {
    const result = computeThumbnailDimensions(400, 400, 200, 200)

    expect(result).toEqual({ width: 200, height: 200 })
  })

  it('handles exact match dimensions', () => {
    const result = computeThumbnailDimensions(200, 300, 200, 300)

    expect(result).toEqual({ width: 200, height: 300 })
  })

  it('rounds to integers', () => {
    const result = computeThumbnailDimensions(333, 777, 200, 300)

    expect(Number.isInteger(result.width)).toBe(true)
    expect(Number.isInteger(result.height)).toBe(true)
  })

  it('returns minimum 1x1 for zero-dimension input', () => {
    const result = computeThumbnailDimensions(0, 0, 200, 300)

    expect(result.width).toBeGreaterThanOrEqual(1)
    expect(result.height).toBeGreaterThanOrEqual(1)
  })
})
