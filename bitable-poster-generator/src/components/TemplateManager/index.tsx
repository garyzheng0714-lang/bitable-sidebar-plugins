import { useRef, useState, useCallback } from 'react'
import { Button, Empty, Modal, Toast, Tabs, TabPane, Switch } from '@douyinfe/semi-ui'
import { IconUpload } from '@douyinfe/semi-icons'
import type { useCanvas } from '../../hooks/useCanvas'
import type { TemplateConfig } from '../../types'
import { getAuthToken } from '../../services/api'
import {
  deleteTemplate,
  generateId,
  loadAllTemplates,
  loadTeamTemplates,
  saveTemplate,
} from '../../utils/canvasSerializer'

interface TemplateManagerProps {
  canvasHook: ReturnType<typeof useCanvas>
}

export function TemplateManager({ canvasHook }: TemplateManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [visible, setVisible] = useState(false)
  const [myTemplates, setMyTemplates] = useState<TemplateConfig[]>([])
  const [teamTemplates, setTeamTemplates] = useState<TemplateConfig[]>([])
  const [shareToTeam, setShareToTeam] = useState(false)

  const isLoggedIn = !!getAuthToken()

  const refreshTemplates = useCallback(async () => {
    const mine = await loadAllTemplates()
    setMyTemplates(mine)
    if (isLoggedIn) {
      const team = await loadTeamTemplates()
      setTeamTemplates(team)
    }
  }, [isLoggedIn])

  const makeTemplateName = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `模板 ${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    canvasHook.setBackgroundImage(url)
    e.target.value = ''
  }

  const handleSaveTemplate = async () => {
    const canvasJson = canvasHook.getCanvasJson()
    if (!canvasJson || canvasJson === '{}') {
      Toast.warning({ content: '画布为空，无法保存模板' })
      return
    }

    const visibility = shareToTeam ? 'team' : 'private'
    const template: TemplateConfig = {
      id: generateId(),
      name: makeTemplateName(),
      width: canvasHook.templateSize.width,
      height: canvasHook.templateSize.height,
      backgroundUrl: '',
      placeholders: [],
      canvasJson,
      thumbnailDataUrl: canvasHook.exportAsDataUrl(0.2) ?? undefined,
      visibility,
      updatedAt: new Date().toISOString(),
    }

    await saveTemplate(template, visibility)
    await refreshTemplates()
    Toast.success({ content: visibility === 'team' ? '模板已保存并分享给团队' : '模板已保存' })
  }

  const handleLoadTemplate = async (template: TemplateConfig) => {
    await canvasHook.loadCanvasJson(template.canvasJson)
    setVisible(false)
    Toast.success({ content: `已加载「${template.name}」` })
  }

  const handleDeleteTemplate = async (template: TemplateConfig) => {
    const ok = window.confirm(`确定删除模板「${template.name}」吗？`)
    if (!ok) return
    await deleteTemplate(template.id)
    await refreshTemplates()
  }

  const renderTemplateList = (templates: TemplateConfig[], showDelete: boolean) => {
    if (templates.length === 0) {
      return (
        <Empty description={showDelete ? '暂无模板，先在画布编辑后点击"保存模板"' : '团队暂无共享模板'} />
      )
    }

    return (
      <div className="template-list">
        {templates
          .slice()
          .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
          .map((template) => (
            <div className="template-card" key={template.id}>
              <div className="template-thumb">
                {template.thumbnailDataUrl ? (
                  <img src={template.thumbnailDataUrl} alt={template.name} />
                ) : (
                  <div className="template-thumb-empty">无预览</div>
                )}
              </div>

              <div className="template-card-meta">
                <div className="template-card-title">
                  {template.name}
                  {template.visibility === 'team' && (
                    <span className="template-team-badge">团队</span>
                  )}
                </div>
                <div className="template-card-size">
                  {template.width} x {template.height}
                </div>
              </div>

              <div className="template-card-actions">
                <Button
                  size="small"
                  theme="solid"
                  type="primary"
                  onClick={() => handleLoadTemplate(template)}
                >
                  加载
                </Button>
                {showDelete && (
                  <Button
                    size="small"
                    theme="borderless"
                    type="danger"
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    删除
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="header-template">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />
      <Button
        icon={<IconUpload />}
        size="small"
        theme="borderless"
        onClick={() => fileInputRef.current?.click()}
      >
        上传底图
      </Button>
      <Button
        size="small"
        theme="borderless"
        onClick={handleSaveTemplate}
      >
        保存模板
      </Button>
      <Button
        size="small"
        theme="borderless"
        onClick={async () => {
          await refreshTemplates()
          setVisible(true)
        }}
      >
        模板库
      </Button>

      <Modal
        title="模板库"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        className="template-modal"
      >
        {isLoggedIn ? (
          <>
            <Tabs type="line" size="small">
              <TabPane tab="我的模板" itemKey="mine">
                {renderTemplateList(myTemplates, true)}
              </TabPane>
              <TabPane tab="团队模板" itemKey="team">
                {renderTemplateList(teamTemplates, false)}
              </TabPane>
            </Tabs>
            <div className="template-share-toggle">
              <Switch
                size="small"
                checked={shareToTeam}
                onChange={setShareToTeam}
              />
              <span className="template-share-label">
                保存时分享给团队
              </span>
            </div>
          </>
        ) : (
          renderTemplateList(myTemplates, true)
        )}
      </Modal>
    </div>
  )
}
