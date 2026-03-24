interface FieldLike {
  id: string
  name: string
  type: number
}

const GENERIC_LABELS = new Set([
  'text', 'Text', 'Image', 'image', 'Logo', 'logo', 'QR Code', 'qrcode', '二维码',
])

export function suggestFieldBinding(
  placeholderLabel: string,
  fields: FieldLike[],
): FieldLike | null {
  if (!placeholderLabel || fields.length === 0) return null
  if (GENERIC_LABELS.has(placeholderLabel)) return null

  const labelLower = placeholderLabel.toLowerCase()

  // Exact match (case-insensitive)
  const exact = fields.find((f) => f.name.toLowerCase() === labelLower)
  if (exact) return exact

  // Label contains field name or field name contains label
  const partial = fields.find((f) => {
    const fieldLower = f.name.toLowerCase()
    return labelLower.includes(fieldLower) || fieldLower.includes(labelLower)
  })
  if (partial) return partial

  return null
}
