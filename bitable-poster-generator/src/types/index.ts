import type { FieldType } from '@lark-base-open/js-sdk'

export interface PlaceholderBinding {
  fieldId: string
  fieldName: string
  fieldType: FieldType
}

export interface TextPlaceholderConfig {
  type: 'text'
  id: string
  label: string
  binding: PlaceholderBinding | null
  fontSize: number
  fontFamily: string
  fontColor: string
  fontWeight: string
  textAlign: string
}

export interface ImagePlaceholderConfig {
  type: 'image'
  id: string
  label: string
  binding: PlaceholderBinding | null
}

export type PlaceholderConfig = TextPlaceholderConfig | ImagePlaceholderConfig

export interface TemplateConfig {
  id: string
  name: string
  width: number
  height: number
  backgroundUrl: string
  placeholders: PlaceholderConfig[]
  canvasJson: string
  thumbnailDataUrl?: string
  visibility?: 'private' | 'team'
  updatedAt?: string
}

export interface FieldMeta {
  id: string
  name: string
  type: FieldType
}

export type GenerateMode = 'selected' | 'all'

export interface GenerateProgress {
  current: number
  total: number
  status: 'idle' | 'generating' | 'done' | 'error'
  message: string
}
