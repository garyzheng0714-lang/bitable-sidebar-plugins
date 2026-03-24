import { Select, Typography } from '@douyinfe/semi-ui'
import type { useCanvas } from '../../hooks/useCanvas'
import type { PlaceholderObject } from '../../hooks/useCanvas'
import type { FieldMeta } from '../../types'

const { Text } = Typography

interface FieldBinderProps {
  canvasHook: ReturnType<typeof useCanvas>
  textFields: FieldMeta[]
  imageFields: FieldMeta[]
}

export function FieldBinder({ canvasHook, textFields, imageFields }: FieldBinderProps) {
  const { activeObject, bindField, placeholders, canvas } = canvasHook

  const handleBind = (placeholder: PlaceholderObject, fieldId: string | undefined) => {
    if (!fieldId) {
      bindField(null, placeholder)
      return
    }
    const fields = (placeholder.placeholderType === 'text' || placeholder.placeholderType === 'qrcode') ? textFields : imageFields
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return
    bindField({ fieldId: field.id, fieldName: field.name, fieldType: field.type }, placeholder)
  }

  if (placeholders.length === 0) {
    return (
      <div className="binding-empty">
        <div className="binding-empty-text">
          点击工具栏的文字/图片按钮添加占位框
        </div>
      </div>
    )
  }

  return (
    <div className="binding-list">
      {placeholders.map((p) => {
        const isText = p.placeholderType === 'text'
        const isQrCode = p.placeholderType === 'qrcode'
        const fields = (isText || isQrCode) ? textFields : imageFields
        const isActive = activeObject?.placeholderId === p.placeholderId

        return (
          <div
            key={p.placeholderId}
            className={`binding-row ${isActive ? 'binding-row-active' : ''}`}
            onClick={() => {
              canvas?.setActiveObject(p)
              canvas?.renderAll()
            }}
          >
            <div className="binding-row-label">
              <span className={`binding-type-indicator ${isText ? 'type-text' : 'type-image'}`}>
                {isText ? 'T' : 'I'}
              </span>
              <Text
                ellipsis={{ showTooltip: true }}
                style={{ maxWidth: 70, fontSize: 12 }}
              >
                {p.placeholderLabel ?? p.placeholderId}
              </Text>
            </div>
            <Select
              size="small"
              style={{ flex: 1, minWidth: 0 }}
              placeholder="选择字段"
              value={p.binding?.fieldId ?? undefined}
              showClear
              filter
              onChange={(v) => handleBind(p, v as string | undefined)}
              optionList={fields.map((f) => ({
                label: f.name,
                value: f.id,
              }))}
              dropdownStyle={{ maxWidth: 240 }}
              clickToHide
            />
          </div>
        )
      })}
    </div>
  )
}
