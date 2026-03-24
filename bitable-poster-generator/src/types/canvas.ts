import type * as fabric from 'fabric'
import type { PlaceholderBinding } from './index'

export interface PlaceholderObject extends fabric.FabricObject {
  placeholderId?: string
  placeholderType?: 'text' | 'image' | 'qrcode'
  placeholderLabel?: string
  placeholderShape?: 'rect' | 'circle'
  placeholderFit?: 'cover' | 'contain'
  placeholderBoxHeight?: number
  placeholderFontSizeMax?: number
  placeholderLocked?: boolean
  binding?: PlaceholderBinding | null
}
