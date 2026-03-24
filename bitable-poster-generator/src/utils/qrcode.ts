import QRCode from 'qrcode'

const PLACEHOLDER_TEXT = 'https://example.com'

export async function generateQrDataUrl(
  text: string,
  size: number = 200,
): Promise<string> {
  const input = text.trim() || PLACEHOLDER_TEXT
  const maxLength = 2000
  const truncated = input.length > maxLength ? input.slice(0, maxLength) : input

  return QRCode.toDataURL(truncated, {
    width: size,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })
}
