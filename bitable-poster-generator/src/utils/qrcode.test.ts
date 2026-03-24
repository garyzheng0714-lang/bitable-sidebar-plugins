import { describe, it, expect } from 'vitest'
import { generateQrDataUrl } from './qrcode'

describe('generateQrDataUrl', () => {
  it('generates a data URL from text input', async () => {
    const result = await generateQrDataUrl('https://example.com')

    expect(result).toMatch(/^data:image\/png;base64,/)
  })

  it('uses placeholder text when input is empty', async () => {
    const result = await generateQrDataUrl('')

    expect(result).toMatch(/^data:image\/png;base64,/)
    // Should not throw
  })

  it('uses placeholder text when input is whitespace only', async () => {
    const result = await generateQrDataUrl('   ')

    expect(result).toMatch(/^data:image\/png;base64,/)
  })

  it('truncates input exceeding max length without throwing', async () => {
    const longInput = 'x'.repeat(5000)

    // Should not throw — input is truncated to safe length
    const result = await generateQrDataUrl(longInput)
    expect(result).toMatch(/^data:image\/png;base64,/)
  })

  it('respects custom size parameter', async () => {
    const small = await generateQrDataUrl('test', 100)
    const large = await generateQrDataUrl('test', 400)

    // Larger size = longer base64 string (more pixels)
    expect(large.length).toBeGreaterThan(small.length)
  })

  it('handles Chinese characters', async () => {
    const result = await generateQrDataUrl('你好世界')

    expect(result).toMatch(/^data:image\/png;base64,/)
  })

  it('handles URL with query parameters', async () => {
    const result = await generateQrDataUrl('https://example.com/path?key=value&foo=bar#section')

    expect(result).toMatch(/^data:image\/png;base64,/)
  })
})
