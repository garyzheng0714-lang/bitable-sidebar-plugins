import { useRef, useState } from 'react'
import {
  Button,
  RadioGroup,
  Radio,
  Progress,
  Toast,
  Select,
} from '@douyinfe/semi-ui'
import { IconPlay, IconClose, IconDownload, IconPlus } from '@douyinfe/semi-icons'
import { bitable } from '@lark-base-open/js-sdk'
import type { useCanvas } from '../../hooks/useCanvas'
import type { useBitable } from '../../hooks/useBitable'
import { generatePosterForRecord, downloadBlob, dataUrlToBlob } from '../../services/posterGenerator'
import type { GenerateMode, GenerateProgress } from '../../types'

type OutputMode = 'download' | 'attachment'

interface GeneratePanelProps {
  canvasHook: ReturnType<typeof useCanvas>
  bitableHook: ReturnType<typeof useBitable>
}

export function GeneratePanel({ canvasHook, bitableHook }: GeneratePanelProps) {
  const [mode, setMode] = useState<GenerateMode>('selected')
  const [outputMode, setOutputMode] = useState<OutputMode>('download')
  const [targetFieldId, setTargetFieldId] = useState<string | undefined>()
  const [progress, setProgress] = useState<GenerateProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    message: '',
  })
  const cancelledRef = useRef(false)

  const isStandalone = bitableHook.isStandalone
  const isGenerating = progress.status === 'generating'

  const handlePreviewExport = () => {
    const dataUrl = canvasHook.exportAsDataUrl(2)
    if (!dataUrl) {
      Toast.warning({ content: '画布为空' })
      return
    }
    const blob = dataUrlToBlob(dataUrl)
    downloadBlob(blob, `poster-preview-${Date.now()}.png`)
    Toast.success({ content: '预览图已导出' })
  }

  const handleCreateField = async () => {
    const fieldId = await bitableHook.createAttachmentField('海报')
    if (fieldId) {
      setTargetFieldId(fieldId)
      Toast.success({ content: '已创建「海报」附件字段' })
    } else {
      Toast.error({ content: '创建字段失败' })
    }
  }

  const handleGenerate = async () => {
    if (isStandalone) {
      handlePreviewExport()
      return
    }

    const canvasJson = canvasHook.getCanvasJson()
    if (!canvasJson || canvasJson === '{}') {
      Toast.warning({ content: '画布为空' })
      return
    }

    const { placeholders } = canvasHook
    const hasBound = placeholders.some((p) => p.binding)
    if (!hasBound) {
      Toast.warning({ content: '请先绑定字段' })
      return
    }

    if (outputMode === 'attachment' && !targetFieldId) {
      Toast.warning({ content: '请选择目标附件字段' })
      return
    }

    let recordIds: string[] = []

    if (mode === 'selected') {
      try {
        const selection = await bitable.base.getSelection()
        if (selection?.recordId) {
          recordIds = [selection.recordId]
        } else {
          Toast.warning({ content: '请先选择一行数据' })
          return
        }
      } catch {
        Toast.warning({ content: '无法获取选中行' })
        return
      }
    } else {
      recordIds = await bitableHook.getRecordIds()
    }

    if (recordIds.length === 0) {
      Toast.warning({ content: '没有数据行' })
      return
    }

    cancelledRef.current = false
    setProgress({ current: 0, total: recordIds.length, status: 'generating', message: '' })

    const exitWhenCancelled = () => {
      if (!cancelledRef.current) {
        return false
      }

      setProgress((prev) => ({ ...prev, status: 'idle', message: '' }))
      Toast.info({ content: '已取消生成' })
      return true
    }

    let successCount = 0
    const throttleMs = outputMode === 'attachment' ? 500 : 0

    for (const recordId of recordIds) {
      if (exitWhenCancelled()) {
        return
      }

      try {
        const blob = await generatePosterForRecord(canvasJson, recordId, {
          getCellText: bitableHook.getCellText,
          getAttachmentUrls: bitableHook.getAttachmentUrls,
        }, 2, () => cancelledRef.current)

        if (exitWhenCancelled()) {
          return
        }

        if (blob) {
          if (outputMode === 'attachment' && targetFieldId) {
            const ok = await bitableHook.writeAttachment(
              targetFieldId,
              recordId,
              blob,
              `poster-${recordId}.png`,
            )

            if (exitWhenCancelled()) {
              return
            }

            if (ok) successCount++

            if (throttleMs > 0) {
              await new Promise((r) => setTimeout(r, throttleMs))
            }
          } else {
            downloadBlob(blob, `poster-${recordId}.png`)
            successCount++
          }
        }

        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      } catch (err) {
        console.error('Failed to generate poster for record', recordId, err)
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
      }
    }

    setProgress((prev) => ({ ...prev, status: 'done', message: '' }))
    const failCount = recordIds.length - successCount
    if (outputMode === 'attachment') {
      if (failCount > 0) {
        Toast.warning({ content: `已写入 ${successCount} 张海报，${failCount} 张失败` })
      } else {
        Toast.success({ content: `已写入 ${successCount} 张海报到表格` })
      }
    } else {
      Toast.success({ content: `已下载 ${successCount} 张海报` })
    }
  }

  const handleCancel = () => {
    cancelledRef.current = true
  }

  if (isStandalone) {
    return (
      <div className="generate-actions">
        <Button
          theme="solid"
          type="primary"
          icon={<IconDownload />}
          onClick={handlePreviewExport}
          size="small"
        >
          导出预览图
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="generate-option">
        <RadioGroup
          value={mode}
          onChange={(e) => setMode(e.target.value as GenerateMode)}
          direction="horizontal"
        >
          <Radio value="selected">选中行</Radio>
          <Radio value="all">全部行</Radio>
        </RadioGroup>
      </div>

      <div className="generate-option">
        <span className="option-label">输出到</span>
        <RadioGroup
          value={outputMode}
          onChange={(e) => setOutputMode(e.target.value as OutputMode)}
          direction="horizontal"
          type="button"
        >
          <Radio value="download">下载</Radio>
          <Radio value="attachment">写入表格</Radio>
        </RadioGroup>
      </div>

      {outputMode === 'attachment' && (
        <div className="generate-field-select">
          <Select
            size="small"
            placeholder="选择附件字段"
            value={targetFieldId}
            onChange={(v) => setTargetFieldId(v as string | undefined)}
            style={{ flex: 1 }}
            optionList={bitableHook.attachmentFields.map((f) => ({
              label: f.name,
              value: f.id,
            }))}
            emptyContent="暂无附件字段"
            showClear
          />
          <Button
            size="small"
            icon={<IconPlus />}
            onClick={handleCreateField}
            style={{ flexShrink: 0 }}
          />
        </div>
      )}

      {isGenerating && (
        <div className="generate-progress">
          <Progress
            percent={Math.round((progress.current / progress.total) * 100)}
            showInfo
            size="small"
          />
        </div>
      )}

      <div className="generate-actions">
        <Button
          theme="solid"
          type="primary"
          icon={<IconPlay />}
          loading={isGenerating}
          onClick={handleGenerate}
          disabled={isGenerating}
          size="small"
        >
          {isGenerating
            ? `${progress.current}/${progress.total}`
            : '开始生成'}
        </Button>
        {isGenerating && (
          <Button type="danger" icon={<IconClose />} onClick={handleCancel} size="small" />
        )}
      </div>
    </div>
  )
}
