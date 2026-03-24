import * as fabric from 'fabric'
import { InputNumber, Select, Typography } from '@douyinfe/semi-ui'
import type { useCanvas } from '../../hooks/useCanvas'

const { Text } = Typography

interface PropertyPanelProps {
  canvasHook: ReturnType<typeof useCanvas>
}

function getObjectWidth(obj: fabric.FabricObject): number {
  return Math.round((obj.width ?? 0) * (obj.scaleX ?? 1))
}

function getObjectHeight(obj: fabric.FabricObject): number {
  return Math.round((obj.height ?? 0) * (obj.scaleY ?? 1))
}

export function PropertyPanel({ canvasHook }: PropertyPanelProps) {
  const {
    activeObject,
    updateTextFontSize,
    updateTextBoxWidth,
    updateImageSize,
    updateObjectTransform,
    updateImageFit,
  } = canvasHook

  if (!activeObject || !activeObject.placeholderType) {
    return (
      <div className="binding-empty">
        <div className="binding-empty-text">
          选中画布对象后可用数字精确设置大小
        </div>
      </div>
    )
  }

  const left = Math.round(activeObject.left ?? 0)
  const top = Math.round(activeObject.top ?? 0)
  const angle = Math.round(activeObject.angle ?? 0)
  const isText = activeObject.placeholderType === 'text'
  const isImage = activeObject.placeholderType === 'image'
  const isCircleLogo = activeObject.placeholderShape === 'circle'
  const fitMode = activeObject.placeholderFit ?? 'cover'
  const width = getObjectWidth(activeObject)
  const height = getObjectHeight(activeObject)
  const diameter = activeObject instanceof fabric.Circle
    ? Math.round((activeObject.radius ?? 0) * 2 * (activeObject.scaleX ?? 1))
    : Math.min(width, height)
  const textObj = activeObject as unknown as fabric.Textbox
  const fontSize = Math.round(textObj.fontSize ?? 36)
  const textBoxWidth = isText ? Math.round((textObj.width ?? 240) * (textObj.scaleX ?? 1)) : 0

  return (
    <div className="property-panel">
      <div className="property-row">
        <Text className="property-label">X</Text>
        <InputNumber
          size="small"
          min={-5000}
          max={5000}
          step={1}
          value={left}
          onChange={(value) => {
            if (typeof value === 'number') {
              updateObjectTransform({ left: value, top, angle })
            }
          }}
          hideButtons
          style={{ width: 120 }}
        />
      </div>
      <div className="property-row">
        <Text className="property-label">Y</Text>
        <InputNumber
          size="small"
          min={-5000}
          max={5000}
          step={1}
          value={top}
          onChange={(value) => {
            if (typeof value === 'number') {
              updateObjectTransform({ left, top: value, angle })
            }
          }}
          hideButtons
          style={{ width: 120 }}
        />
      </div>
      <div className="property-row">
        <Text className="property-label">角度</Text>
        <InputNumber
          size="small"
          min={-360}
          max={360}
          step={1}
          value={angle}
          onChange={(value) => {
            if (typeof value === 'number') {
              updateObjectTransform({ left, top, angle: value })
            }
          }}
          hideButtons
          style={{ width: 120 }}
        />
      </div>

      {isText && (
        <>
          <div className="property-row">
            <Text className="property-label">字号</Text>
            <InputNumber
              size="small"
              min={8}
              max={360}
              step={1}
              value={fontSize}
              onChange={(value) => {
                if (typeof value === 'number') updateTextFontSize(value)
              }}
              hideButtons
              style={{ width: 120 }}
            />
          </div>
          <div className="property-row">
            <Text className="property-label">框宽</Text>
            <InputNumber
              size="small"
              min={40}
              max={2000}
              step={1}
              value={textBoxWidth}
              onChange={(value) => {
                if (typeof value === 'number') updateTextBoxWidth(value)
              }}
              hideButtons
              style={{ width: 120 }}
            />
          </div>
        </>
      )}

      {isImage && isCircleLogo && (
        <div className="property-row">
          <Text className="property-label">直径</Text>
          <InputNumber
            size="small"
            min={24}
            max={2000}
            step={1}
            value={diameter}
            onChange={(value) => {
              if (typeof value === 'number') updateImageSize({ diameter: value })
            }}
            hideButtons
            style={{ width: 120 }}
          />
        </div>
      )}

      {isImage && !isCircleLogo && (
        <>
          <div className="property-row">
            <Text className="property-label">宽度</Text>
            <InputNumber
              size="small"
              min={24}
              max={2000}
              step={1}
              value={width}
              onChange={(value) => {
                if (typeof value === 'number') {
                  updateImageSize({ width: value, height })
                }
              }}
              hideButtons
              style={{ width: 120 }}
            />
          </div>
          <div className="property-row">
            <Text className="property-label">高度</Text>
            <InputNumber
              size="small"
              min={24}
              max={2000}
              step={1}
              value={height}
              onChange={(value) => {
                if (typeof value === 'number') {
                  updateImageSize({ width, height: value })
                }
              }}
              hideButtons
              style={{ width: 120 }}
            />
          </div>
        </>
      )}

      {isImage && (
        <div className="property-row">
          <Text className="property-label">填充</Text>
          <Select
            size="small"
            value={fitMode}
            style={{ width: 120 }}
            optionList={[
              { label: '铺满裁切', value: 'cover' },
              { label: '完整显示', value: 'contain' },
            ]}
            onChange={(value) => {
              if (value === 'cover' || value === 'contain') {
                updateImageFit(value)
              }
            }}
          />
        </div>
      )}

      {isCircleLogo && fitMode === 'cover' && (
        <Text className="property-hint">
          圆形 logo 建议用「完整显示」，可避免长方形 logo 被裁切。
        </Text>
      )}
    </div>
  )
}
