import { describe, it, expect } from 'vitest'
import { buildZipFilename, shouldUseZip } from './zipExport'

describe('buildZipFilename', () => {
  it('generates filename with timestamp', () => {
    const result = buildZipFilename()

    expect(result).toMatch(/^posters-\d{8}-\d{6}\.zip$/)
  })
})

describe('shouldUseZip', () => {
  it('returns true for multiple records', () => {
    expect(shouldUseZip(5)).toBe(true)
  })

  it('returns false for single record', () => {
    expect(shouldUseZip(1)).toBe(false)
  })

  it('returns false for zero records', () => {
    expect(shouldUseZip(0)).toBe(false)
  })
})
