import { useEffect, useMemo, useRef, useState } from 'react'
import * as fabric from 'fabric'
import {
  Button,
  Select,
  InputNumber,
  Toast,
  Progress,
  RadioGroup,
  Radio,
} from '@douyinfe/semi-ui'
import { IconPlay, IconDownload, IconClose, IconPlus } from '@douyinfe/semi-icons'
import { bitable } from '@lark-base-open/js-sdk'
import type { useCanvas } from '../../hooks/useCanvas'
import type { PlaceholderObject } from '../../hooks/useCanvas'
import type { useBitable } from '../../hooks/useBitable'
import { generatePosterForRecord, downloadBlob, dataUrlToBlob } from '../../services/posterGenerator'
import { downloadAsZip } from '../../utils/zipExport'

const FONT_OPTIONS = [
  { label: '系统默认', value: 'PingFang SC, Microsoft YaHei, sans-serif' },
  { label: '阿里巴巴普惠', value: 'Alibaba PuHuiTi' },
  { label: 'Sk-Modernist', value: 'Sk-Modernist' },
]

const FONT_WEIGHT_OPTIONS = [
  { label: 'Light', value: '300' },
  { label: '常规', value: '400' },
  { label: 'Medium', value: '500' },
  { label: '加粗', value: '700' },
  { label: 'Heavy', value: '900' },
]

interface Props {
  canvasHook: ReturnType<typeof useCanvas>
  bitableHook: ReturnType<typeof useBitable>
}

export function UnifiedPanel({ canvasHook, bitableHook }: Props) {
  const {
    activeObject,
    placeholders,
    canvas,
    bindField,
    updateTextFontSize,
    updateTextBoxWidth,
    updateTextBoxHeight,
    updateTextAlign,
    updateTextFontWeight,
    updateImageSize,
    updateObjectTransform,
    updateImageFit,
    updateTextColor,
    updateTextFontFamily,
    getCanvasJson,
    exportAsDataUrl,
    previewRecord,
    clearPreview,
  } = canvasHook

  const {
    textFields,
    imageFields,
    attachmentFields,
    isStandalone,
    getCellText,
    getAttachmentUrls,
    getRecordIds,
    writeAttachment,
    createAttachmentField,
  } = bitableHook

  const [targetFieldId, setTargetFieldId] = useState<string | undefined>()
  const [outputMode, setOutputMode] = useState<'attachment' | 'zip'>('attachment')
  const [writeMode, setWriteMode] = useState<'append' | 'overwrite'>('append')
  const [generating, setGenerating] = useState(false)
  const [generationScope, setGenerationScope] = useState<'selected' | 'all' | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const cancelledRef = useRef(false)

  const effectiveTargetFieldId = useMemo(() => {
    if (!targetFieldId) return attachmentFields[0]?.id
    return attachmentFields.some((field) => field.id === targetFieldId)
      ? targetFieldId
      : attachmentFields[0]?.id
  }, [attachmentFields, targetFieldId])

  const allBound = placeholders.length > 0 && placeholders.every((p) => !!p.binding)
  const missingBindings = placeholders.filter((p) => !p.binding)
  const canGenerate = allBound && !generating && (outputMode === 'zip' || !!effectiveTargetFieldId)

  // Auto-preview when bitable selection changes
  useEffect(() => {
    if (isStandalone) return

    let cancelled = false
    const runPreview = async () => {
      try {
        const selection = await bitable.base.getSelection()
        if (cancelled) return
        if (selection?.recordId) {
          const hasBound = placeholders.some((p) => p.binding)
          if (hasBound) {
            await previewRecord(selection.recordId, {
              getCellText,
              getAttachmentUrls,
            })
          } else {
            clearPreview()
          }
        } else {
          clearPreview()
        }
      } catch {
        // ignore
      }
    }

    runPreview()

    let off: (() => void) | undefined
    try {
      off = bitable.base.onSelectionChange(() => {
        if (!cancelled) runPreview()
      })
    } catch {
      // standalone
    }

    return () => {
      cancelled = true
      off?.()
    }
  }, [isStandalone, placeholders, previewRecord, clearPreview, getCellText, getAttachmentUrls])

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

  const handlePreviewExport = () => {
    const dataUrl = exportAsDataUrl(2)
    if (!dataUrl) {
      Toast.warning({ content: '画布为空' })
      return
    }
    const blob = dataUrlToBlob(dataUrl)
    downloadBlob(blob, `poster-preview-${Date.now()}.png`)
    Toast.success({ content: '预览图已导出' })
  }

  const getSelectedRecordId = async (): Promise<string | null> => {
    try {
      const selection = await bitable.base.getSelection()
      return selection?.recordId ?? null
    } catch {
      return null
    }
  }

  const handleGenerate = async (scope: 'selected' | 'all') => {
    if (isStandalone) {
      handlePreviewExport()
      return
    }

    const canvasJson = getCanvasJson()
    if (!canvasJson || canvasJson === '{}') {
      Toast.warning({ content: '画布为空' })
      return
    }

    if (!allBound) {
      Toast.warning({ content: '请先完成全部占位框绑定' })
      return
    }

    if (outputMode === 'attachment' && !effectiveTargetFieldId) {
      Toast.warning({ content: '请选择目标附件字段' })
      return
    }

    let recordIds: string[] = []
    if (scope === 'selected') {
      const recordId = await getSelectedRecordId()
      if (recordId) {
        recordIds = [recordId]
      } else {
        Toast.warning({ content: '无法获取选中行' })
        return
      }
    } else {
      recordIds = await getRecordIds()
    }

    if (recordIds.length === 0) {
      Toast.warning({ content: '没有数据行' })
      return
    }

    cancelledRef.current = false
    setGenerating(true)
    setGenerationScope(scope)
    setProgress({ current: 0, total: recordIds.length })

    const exitWhenCancelled = () => {
      if (!cancelledRef.current) {
        return false
      }

      setGenerating(false)
      setGenerationScope(null)
      Toast.info({ content: '已取消生成' })
      return true
    }

    let successCount = 0
    const zipEntries: Array<{ blob: Blob; filename: string }> = []

    for (const recordId of recordIds) {
      if (exitWhenCancelled()) return

      try {
        const blob = await generatePosterForRecord(canvasJson, recordId, {
          getCellText,
          getAttachmentUrls,
        }, 2, () => cancelledRef.current)

        if (exitWhenCancelled()) return

        if (blob) {
          if (outputMode === 'zip') {
            zipEntries.push({ blob, filename: `poster-${recordId}.png` })
            successCount++
          } else {
            const ok = await writeAttachment(
              effectiveTargetFieldId!,
              recordId,
              blob,
              `poster-${recordId}.png`,
              writeMode,
            )
            if (exitWhenCancelled()) return
            if (ok) successCount++
          }
        }
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      } catch (err) {
        console.error('Failed to generate poster for record', recordId, err)
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      }
    }

    if (outputMode === 'zip' && zipEntries.length > 0) {
      await downloadAsZip(zipEntries)
    }

    setGenerating(false)
    setGenerationScope(null)
    const failCount = recordIds.length - successCount
    if (outputMode === 'zip') {
      Toast.success({ content: `已打包 ${successCount} 张海报为 ZIP` })
    } else if (failCount > 0) {
      Toast.warning({ content: `已写入 ${successCount} 张海报，${failCount} 张失败` })
    } else {
      Toast.success({ content: `已写入 ${successCount} 张海报到表格` })
    }
  }

  return (
    <div className="unified-panel">
      <div className="unified-panel-list">
        {placeholders.length === 0 ? (
          <div className="panel-empty-hint">
            点击左侧工具栏添加文字或图片占位框
          </div>
        ) : (
          placeholders.map((p) => {
            const isText = p.placeholderType === 'text'
            const isQrCode = p.placeholderType === 'qrcode'
            const isActive = activeObject?.placeholderId === p.placeholderId
            const fields = (isText || isQrCode) ? textFields : imageFields
            const isCircle = p.placeholderShape === 'circle'

            const textObj = p as unknown as fabric.Textbox
            const fontSize = isText ? Math.round(p.placeholderFontSizeMax ?? textObj.fontSize ?? 36) : 0
            const textBoxWidth = isText ? Math.round((textObj.width ?? 240) * (textObj.scaleX ?? 1)) : 0
            const textBoxHeight = isText ? Math.round(p.placeholderBoxHeight ?? textObj.height ?? 120) : 0
            const fontWeight = isText ? String(textObj.fontWeight ?? '700') : '400'
            const textColor = isText ? String(textObj.fill ?? '#333333') : ''
            const textAlign = isText
              ? ((textObj.textAlign as 'left' | 'center' | 'right' | undefined) ?? 'center')
              : 'center'
            const fontFamily = isText ? String(textObj.fontFamily ?? '') : ''

            const posX = Math.round(p.left ?? 0)
            const posY = Math.round(p.top ?? 0)
            const angle = Math.round(p.angle ?? 0)

            const imgW = !isText ? Math.round((p.width ?? 0) * (p.scaleX ?? 1)) : 0
            const imgH = !isText ? Math.round((p.height ?? 0) * (p.scaleY ?? 1)) : 0
            const diameter = !isText && isCircle && p instanceof fabric.Circle
              ? Math.round((p.radius ?? 0) * 2 * (p.scaleX ?? 1))
              : 0
            const metricW = isText ? textBoxWidth : (isCircle ? diameter : imgW)
            const metricH = isText ? textBoxHeight : (isCircle ? diameter : imgH)

            const label = p.binding?.fieldName
              ?? (isQrCode ? '二维码' : isText ? '文字' : isCircle ? 'Logo' : '图片')

            return (
              <div
                key={p.placeholderId}
                className={`placeholder-row ${isActive ? 'active' : ''}`}
              >
                <div className="placeholder-row-main">
                  <div
                    className="ph-select-target"
                    onClick={() => {
                      canvas?.setActiveObject(p)
                      canvas?.requestRenderAll()
                    }}
                  >
                    <span className={`ph-badge ${isText ? 'text' : isQrCode ? 'qrcode' : 'image'}`}>
                      {isQrCode ? 'Q' : isText ? 'T' : isCircle ? 'C' : 'I'}
                    </span>
                    <span className="ph-name">{label}</span>
                    {p.placeholderLocked && <span className="ph-lock-icon">🔒</span>}
                  </div>
                  <Select
                    size="small"
                    style={{ width: 120, flexShrink: 0 }}
                    placeholder="绑定字段"
                    value={p.binding?.fieldId ?? undefined}
                    showClear={false}
                    onChange={(v) => handleBind(p, v as string | undefined)}
                    optionList={fields.map((f) => ({
                      label: f.name,
                      value: f.id,
                    }))}
                    dropdownStyle={{ maxWidth: 240 }}
                    clickToHide
                  />
                </div>
                <div className="ph-metrics">
                  X {posX} · Y {posY} · W {metricW} · H {metricH} · 角度 {angle}°
                </div>

                {isActive && (
                  <div className="placeholder-row-props">
                    <div className="prop-field">
                      <span className="prop-label">X</span>
                      <InputNumber
                        size="small"
                        min={-5000}
                        max={5000}
                        step={1}
                        value={posX}
                        onChange={(v) => {
                          if (typeof v === 'number') {
                            updateObjectTransform({ left: v, top: posY, angle }, p)
                          }
                        }}
                        hideButtons
                        style={{ width: 96 }}
                      />
                    </div>
                    <div className="prop-field">
                      <span className="prop-label">Y</span>
                      <InputNumber
                        size="small"
                        min={-5000}
                        max={5000}
                        step={1}
                        value={posY}
                        onChange={(v) => {
                          if (typeof v === 'number') {
                            updateObjectTransform({ left: posX, top: v, angle }, p)
                          }
                        }}
                        hideButtons
                        style={{ width: 96 }}
                      />
                    </div>
                    <div className="prop-field">
                      <span className="prop-label">角度</span>
                      <InputNumber
                        size="small"
                        min={-360}
                        max={360}
                        step={1}
                        value={angle}
                        onChange={(v) => {
                          if (typeof v === 'number') {
                            updateObjectTransform({ left: posX, top: posY, angle: v }, p)
                          }
                        }}
                        hideButtons
                        style={{ width: 96 }}
                      />
                    </div>
                    {isText && (
                      <>
                        <div className="prop-field">
                          <span className="prop-label">字号</span>
                          <InputNumber
                            size="small"
                            min={8}
                            max={360}
                            step={1}
                            value={fontSize}
                            onChange={(v) => {
                              if (typeof v === 'number') updateTextFontSize(v, p)
                            }}
                            hideButtons
                            style={{ width: 52 }}
                          />
                        </div>
                        <div className="prop-field">
                          <span className="prop-label">框宽</span>
                          <InputNumber
                            size="small"
                            min={40}
                            max={2000}
                            step={1}
                            value={textBoxWidth}
                            onChange={(v) => {
                              if (typeof v === 'number') updateTextBoxWidth(v, p)
                            }}
                            hideButtons
                            style={{ width: 60 }}
                          />
                        </div>
                        <div className="prop-field">
                          <span className="prop-label">框高</span>
                          <InputNumber
                            size="small"
                            min={48}
                            max={2000}
                            step={1}
                            value={textBoxHeight}
                            onChange={(v) => {
                              if (typeof v === 'number') updateTextBoxHeight(v, p)
                            }}
                            hideButtons
                            style={{ width: 60 }}
                          />
                        </div>
                        <div className="prop-field">
                          <span className="prop-label">对齐</span>
                          <Select
                            size="small"
                            value={textAlign}
                            style={{ width: 84 }}
                            optionList={[
                              { label: '居中', value: 'center' },
                              { label: '靠左', value: 'left' },
                              { label: '靠右', value: 'right' },
                            ]}
                            onChange={(v) => {
                              if (v === 'left' || v === 'center' || v === 'right') {
                                updateTextAlign(v, p)
                              }
                            }}
                          />
                        </div>
                        <div className="prop-field">
                          <span className="prop-label">字重</span>
                          <Select
                            size="small"
                            value={fontWeight}
                            style={{ width: 96 }}
                            optionList={FONT_WEIGHT_OPTIONS}
                            onChange={(v) => {
                              if (typeof v === 'string') {
                                updateTextFontWeight(v, p)
                              }
                            }}
                          />
                        </div>
                        <div className="prop-field">
                          <span className="prop-label">颜色</span>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => updateTextColor(e.target.value, p)}
                            onClick={(e) => e.stopPropagation()}
                            className="color-picker"
                          />
                        </div>
                        <div className="prop-field">
                          <span className="prop-label">字体</span>
                          <Select
                            size="small"
                            value={fontFamily}
                            style={{ width: 140 }}
                            optionList={FONT_OPTIONS}
                            onChange={(v) => {
                              if (typeof v === 'string') updateTextFontFamily(v, p)
                            }}
                          />
                        </div>
                      </>
                    )}
                    {!isText && isCircle && (
                      <div className="prop-field">
                        <span className="prop-label">直径</span>
                        <InputNumber
                          size="small"
                          min={24}
                          max={2000}
                          step={1}
                          value={diameter}
                          onChange={(v) => {
                            if (typeof v === 'number') updateImageSize({ diameter: v }, p)
                          }}
                          hideButtons
                          style={{ width: 60 }}
                        />
                      </div>
                    )}
                    {!isText && !isCircle && (
                      <>
                        <div className="prop-field">
                          <span className="prop-label">宽</span>
                          <InputNumber
                            size="small"
                            min={24}
                            max={2000}
                            step={1}
                            value={imgW}
                            onChange={(v) => {
                              if (typeof v === 'number') updateImageSize({ width: v, height: imgH }, p)
                            }}
                            hideButtons
                            style={{ width: 56 }}
                          />
                        </div>
                        <div className="prop-field">
                          <span className="prop-label">高</span>
                          <InputNumber
                            size="small"
                            min={24}
                            max={2000}
                            step={1}
                            value={imgH}
                            onChange={(v) => {
                              if (typeof v === 'number') updateImageSize({ width: imgW, height: v }, p)
                            }}
                            hideButtons
                            style={{ width: 56 }}
                          />
                        </div>
                      </>
                    )}
                    {!isText && (
                      <div className="prop-field">
                        <span className="prop-label">填充</span>
                        <Select
                          size="small"
                          value={p.placeholderFit ?? 'contain'}
                          style={{ width: 76 }}
                          optionList={[
                            { label: '铺满', value: 'cover' },
                            { label: '完整', value: 'contain' },
                          ]}
                          onChange={(v) => {
                            if (v === 'cover' || v === 'contain') updateImageFit(v, p)
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="unified-panel-actions">
        {generating && (
          <Progress
            percent={Math.round((progress.current / Math.max(progress.total, 1)) * 100)}
            showInfo
            size="small"
            style={{ marginBottom: 6 }}
          />
        )}

        {isStandalone ? (
          <Button
            theme="solid"
            type="primary"
            icon={<IconDownload />}
            onClick={handlePreviewExport}
            block
            size="small"
          >
            导出预览图
          </Button>
        ) : (
          <>
            <div className={`generate-summary ${allBound ? 'ready' : 'warning'}`}>
              {placeholders.length === 0
                ? '请先添加占位框并完成字段绑定。'
                : missingBindings.length > 0
                ? `还有 ${missingBindings.length} 个占位框未绑定，生成前必须全部绑定。`
                : '已完成绑定，选择附件字段后可直接写入表格。'}
            </div>

            {outputMode === 'attachment' && <div className="generate-field-row">
              <Select
                size="small"
                placeholder="选择写入的附件字段"
                value={effectiveTargetFieldId}
                onChange={(v) => setTargetFieldId(v as string | undefined)}
                style={{ flex: 1 }}
                optionList={attachmentFields.map((f) => ({
                  label: f.name,
                  value: f.id,
                }))}
                emptyContent="暂无附件字段"
                showClear={false}
              />
              <Button
                size="small"
                icon={<IconPlus />}
                onClick={async () => {
                  const fieldId = await createAttachmentField('海报')
                  if (fieldId) {
                    setTargetFieldId(fieldId)
                    Toast.success({ content: '已创建「海报」附件字段' })
                  }
                }}
                style={{ flexShrink: 0 }}
              />
            </div>}

            <div className="generate-mode-row">
              <span className="generate-mode-label">输出方式</span>
              <RadioGroup
                value={outputMode}
                onChange={(e) => setOutputMode(e.target.value as 'attachment' | 'zip')}
                direction="horizontal"
                type="button"
              >
                <Radio value="attachment">写入表格</Radio>
                <Radio value="zip">下载 ZIP</Radio>
              </RadioGroup>
            </div>

            {outputMode === 'attachment' && (
              <div className="generate-mode-row">
                <span className="generate-mode-label">写入方式</span>
                <RadioGroup
                  value={writeMode}
                  onChange={(e) => setWriteMode(e.target.value as 'append' | 'overwrite')}
                  direction="horizontal"
                  type="button"
                >
                  <Radio value="append">追加</Radio>
                  <Radio value="overwrite">覆盖</Radio>
                </RadioGroup>
              </div>
            )}

            <div className="generate-bar">
              <Button
                theme="solid"
                type="primary"
                icon={generating && generationScope === 'selected' ? undefined : <IconPlay />}
                loading={generating && generationScope === 'selected'}
                onClick={() => { void handleGenerate('selected') }}
                disabled={!canGenerate}
                className="generate-split-button"
                style={{ flex: 1 }}
                size="small"
              >
                {generating && generationScope === 'selected'
                  ? `生成中 ${progress.current}/${progress.total}`
                  : '生成单行'}
              </Button>
              <Button
                theme="solid"
                type="primary"
                icon={generating && generationScope === 'all' ? undefined : <IconDownload />}
                loading={generating && generationScope === 'all'}
                onClick={() => { void handleGenerate('all') }}
                disabled={!canGenerate}
                className="generate-split-button"
                style={{ flex: 1 }}
                size="small"
              >
                {generating && generationScope === 'all'
                  ? `生成中 ${progress.current}/${progress.total}`
                  : '生成整表'}
              </Button>
              {generating && (
                <Button
                  type="danger"
                  icon={<IconClose />}
                  onClick={() => { cancelledRef.current = true }}
                  size="small"
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
