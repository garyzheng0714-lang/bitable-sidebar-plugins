import { useState, useRef, useCallback, useEffect } from 'react'
import { Spin, Typography, Banner, Avatar, Button, Dropdown } from '@douyinfe/semi-ui'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useBitable } from './hooks/useBitable'
import { useCanvas } from './hooks/useCanvas'
import { CanvasEditor } from './components/CanvasEditor'
import { Toolbar } from './components/Toolbar'
import { TemplateManager } from './components/TemplateManager'
import { UnifiedPanel } from './components/UnifiedPanel'
import './App.css'

const { Title } = Typography

const CANVAS_DRAFT_KEY = 'poster-canvas-draft'

export default function App() {
  useTheme()
  const auth = useAuth()
  const bitableHook = useBitable()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasHook = useCanvas(containerRef)
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(320)
  const dragStartRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const toggleToolbar = useCallback(() => setToolbarCollapsed((v) => !v), [])

  // Restore canvas draft after login redirect
  const draftRestoredRef = useRef(false)
  useEffect(() => {
    if (draftRestoredRef.current || !canvasHook.canvas) return
    draftRestoredRef.current = true
    const draft = sessionStorage.getItem(CANVAS_DRAFT_KEY)
    if (draft) {
      sessionStorage.removeItem(CANVAS_DRAFT_KEY)
      canvasHook.loadCanvasJson(draft)
    }
  }, [canvasHook.canvas, canvasHook.loadCanvasJson])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const start = dragStartRef.current
      if (!start) return

      const next = Math.min(520, Math.max(180, start.startHeight + (start.startY - e.clientY)))
      setBottomPanelHeight(next)
    }

    const handleUp = () => {
      dragStartRef.current = null
      document.body.classList.remove('panel-resizing')
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      document.body.classList.remove('panel-resizing')
    }
  }, [])

  return (
    <div className="app">
      {bitableHook.loading && (
        <div className="app-loading-overlay">
          <Spin size="large" />
          <p>加载中...</p>
        </div>
      )}
      <div className="app-header">
        <div className="header-left">
          <div className="header-accent" />
          <Title heading={5} style={{ margin: 0 }}>海报生成器</Title>
        </div>
        <div className="header-right">
          <TemplateManager canvasHook={canvasHook} />
          {!auth.loading && !auth.user && (
            <Button
              size="small"
              theme="solid"
              type="primary"
              onClick={() => {
                const json = canvasHook.getCanvasJson()
                if (json && json !== '{}') {
                  sessionStorage.setItem(CANVAS_DRAFT_KEY, json)
                }
                window.location.href = `/api/auth/login?return_url=${encodeURIComponent(window.location.href)}`
              }}
            >
              登录
            </Button>
          )}
          {auth.user && (
            <Dropdown
              trigger="click"
              position="bottomRight"
              render={
                <Dropdown.Menu>
                  <Dropdown.Item disabled style={{ opacity: 0.6, cursor: 'default' }}>
                    {auth.user.name}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={auth.logout}>退出登录</Dropdown.Item>
                </Dropdown.Menu>
              }
            >
              <Avatar
                size="extra-small"
                src={auth.user.avatar_url || undefined}
                alt={auth.user.name}
                style={{ marginLeft: 8, cursor: 'pointer' }}
              >
                {auth.user.name?.[0]}
              </Avatar>
            </Dropdown>
          )}
        </div>
      </div>

      {bitableHook.isStandalone && (
        <Banner
          type="info"
          description="独立预览模式 - 请在多维表格中打开以绑定字段"
          closeIcon={null}
          className="standalone-banner"
        />
      )}

      <div className="canvas-workspace" ref={containerRef}>
        <div className={`side-toolbar ${toolbarCollapsed ? 'collapsed' : ''}`}>
          <div className="side-toolbar-content">
            <Toolbar canvasHook={canvasHook} />
          </div>
        </div>
        <button
          className={`side-toolbar-tab ${toolbarCollapsed ? 'collapsed' : ''}`}
          onClick={toggleToolbar}
        >
          {toolbarCollapsed ? '›' : '‹'}
        </button>
        <CanvasEditor canvasHook={canvasHook} />
      </div>

      <div className="bottom-panel" style={{ height: bottomPanelHeight }}>
        <div
          className="bottom-panel-resize"
          onMouseDown={(e) => {
            dragStartRef.current = { startY: e.clientY, startHeight: bottomPanelHeight }
            document.body.classList.add('panel-resizing')
          }}
        >
          <span className="bottom-panel-resize-grip" />
        </div>
        <UnifiedPanel canvasHook={canvasHook} bitableHook={bitableHook} />
      </div>
    </div>
  )
}
