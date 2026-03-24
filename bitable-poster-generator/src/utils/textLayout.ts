import * as fabric from 'fabric'

export interface TextboxWithBounds extends fabric.Textbox {
  placeholderBoxHeight?: number
  placeholderFontSizeMax?: number
}

export const MIN_TEXTBOX_WIDTH = 40
export const MIN_TEXTBOX_HEIGHT = 48
export const MIN_TEXT_FONT_SIZE = 8

function normalizeText(text?: string | null): string {
  if (!text || text.length === 0) return ' '
  const singleLine = String(text).replace(/\r?\n+/g, ' ').replace(/\s{2,}/g, ' ').trim()
  return singleLine.length > 0 ? singleLine : ' '
}

function fitsSingleLineWidth(textObj: TextboxWithBounds, width: number): boolean {
  const lines = (textObj.textLines?.length ?? 1)
  if (lines > 1) return false

  const lineWidth = typeof textObj.getLineWidth === 'function'
    ? textObj.getLineWidth(0)
    : (textObj.width ?? 0)
  if (!Number.isFinite(lineWidth)) return true
  return lineWidth <= width + 0.5
}

function fitsBox(textObj: TextboxWithBounds, width: number, height: number): boolean {
  const lines = textObj.textLines?.length ?? 1
  for (let i = 0; i < lines; i += 1) {
    const lineWidth = typeof textObj.getLineWidth === 'function'
      ? textObj.getLineWidth(i)
      : (textObj.width ?? 0)
    if (Number.isFinite(lineWidth) && lineWidth > width + 0.5) {
      return false
    }
  }

  const textHeight = textObj.height ?? 0
  return textHeight <= height + 0.5
}

export function getTextboxBounds(textObj: TextboxWithBounds): { width: number; height: number } {
  const width = Math.max(MIN_TEXTBOX_WIDTH, Math.round(textObj.width ?? MIN_TEXTBOX_WIDTH))
  const fallbackHeight = Math.max(
    MIN_TEXTBOX_HEIGHT,
    Math.round(textObj.height ?? 0),
    Math.round((textObj.fontSize ?? 36) * (textObj.lineHeight ?? 1.2) * 2.8),
  )

  return {
    width,
    height: Math.max(MIN_TEXTBOX_HEIGHT, Math.round(textObj.placeholderBoxHeight ?? fallbackHeight)),
  }
}

export function fitTextboxText(
  textObj: TextboxWithBounds,
  options?: {
    text?: string
    maxFontSize?: number
    minFontSize?: number
    preserveCenter?: boolean
  },
): { text: string; fontSize: number; width: number; height: number; truncated: boolean } {
  const { width, height } = getTextboxBounds(textObj)
  const center = options?.preserveCenter === false ? null : textObj.getCenterPoint()
  const sourceText = normalizeText(options?.text ?? textObj.text)
  const maxFontSize = Math.max(
    MIN_TEXT_FONT_SIZE,
    Math.round(options?.maxFontSize ?? textObj.placeholderFontSizeMax ?? textObj.fontSize ?? 36),
  )
  const minFontSize = Math.max(
    MIN_TEXT_FONT_SIZE,
    Math.min(maxFontSize, Math.round(options?.minFontSize ?? MIN_TEXT_FONT_SIZE)),
  )

  textObj.placeholderBoxHeight = height
  textObj.placeholderFontSizeMax = maxFontSize
  textObj.set({
    width,
    text: sourceText,
    splitByGrapheme: false,
    scaleX: 1,
    scaleY: 1,
  })

  let fittedSingleLine = false
  for (let size = maxFontSize; size >= minFontSize; size -= 1) {
    textObj.set({ fontSize: size })
    textObj.initDimensions()
    if (fitsSingleLineWidth(textObj, width)) {
      fittedSingleLine = true
      break
    }
  }

  let fittedMultiLine = false
  if (!fittedSingleLine) {
    textObj.set({
      text: sourceText,
      splitByGrapheme: true,
    })

    for (let size = maxFontSize; size >= minFontSize; size -= 1) {
      textObj.set({ fontSize: size })
      textObj.initDimensions()
      if (fitsBox(textObj, width, height)) {
        fittedMultiLine = true
        break
      }
    }
  }

  if (!fittedSingleLine && !fittedMultiLine) {
    textObj.set({
      fontSize: minFontSize,
      text: sourceText,
      splitByGrapheme: true,
    })
    textObj.initDimensions()
  }

  if (center) {
    textObj.setPositionByOrigin(center, 'center', 'center')
  }
  textObj.setCoords()

  return {
    text: String(textObj.text ?? ' '),
    fontSize: Math.round(textObj.fontSize ?? maxFontSize),
    width,
    height,
    truncated: false,
  }
}
