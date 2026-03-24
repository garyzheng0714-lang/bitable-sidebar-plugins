import { Button, Tooltip } from '@douyinfe/semi-ui'
import { IconUndo, IconRedo, IconFont, IconImage, IconDelete, IconLock, IconUnlock } from '@douyinfe/semi-icons'
import type { useCanvas } from '../../hooks/useCanvas'

interface ToolbarProps {
  canvasHook: ReturnType<typeof useCanvas>
}

export function Toolbar({ canvasHook }: ToolbarProps) {
  const { addTextPlaceholder, addImagePlaceholder, addLogoPlaceholder, addQrCodePlaceholder, toggleLock, deleteActive, undo, redo, activeObject } =
    canvasHook

  const locked = activeObject?.placeholderLocked === true

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('placeholder-type', type)
  }

  return (
    <div className="toolbar vertical">
      <div className="toolbar-group">
        <Tooltip content="添加文字" position="right">
          <Button
            icon={<IconFont />}
            theme="borderless"
            onClick={() => addTextPlaceholder()}
            draggable
            onDragStart={(e) => handleDragStart(e, 'text')}
          />
        </Tooltip>
        <Tooltip content="添加图片" position="right">
          <Button
            icon={<IconImage />}
            theme="borderless"
            onClick={() => addImagePlaceholder()}
            draggable
            onDragStart={(e) => handleDragStart(e, 'image')}
          />
        </Tooltip>
        <Tooltip content="添加圆形Logo" position="right">
          <Button
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'block' }}>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            }
            theme="borderless"
            onClick={() => addLogoPlaceholder()}
            draggable
            onDragStart={(e) => handleDragStart(e, 'logo')}
          />
        </Tooltip>
        <Tooltip content="添加二维码" position="right">
          <Button
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'block' }}>
                <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
                <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
                <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
                <rect x="3" y="3" width="1.5" height="1.5" fill="currentColor" />
                <rect x="10" y="3" width="1.5" height="1.5" fill="currentColor" />
                <rect x="3" y="10" width="1.5" height="1.5" fill="currentColor" />
                <rect x="9" y="9" width="1.5" height="1.5" fill="currentColor" />
                <rect x="11.5" y="9" width="1.5" height="1.5" fill="currentColor" />
                <rect x="9" y="11.5" width="1.5" height="1.5" fill="currentColor" />
                <rect x="11.5" y="11.5" width="1.5" height="1.5" fill="currentColor" />
              </svg>
            }
            theme="borderless"
            onClick={() => addQrCodePlaceholder()}
            draggable
            onDragStart={(e) => handleDragStart(e, 'qrcode')}
          />
        </Tooltip>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <Tooltip content="撤销" position="right">
          <Button icon={<IconUndo />} theme="borderless" onClick={undo} />
        </Tooltip>
        <Tooltip content="重做" position="right">
          <Button icon={<IconRedo />} theme="borderless" onClick={redo} />
        </Tooltip>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <Tooltip content={locked ? '解锁' : '锁定'} position="right">
          <Button
            icon={locked ? <IconLock /> : <IconUnlock />}
            theme="borderless"
            onClick={() => toggleLock()}
            disabled={!activeObject}
          />
        </Tooltip>
        <Tooltip content="删除" position="right">
          <Button
            icon={<IconDelete />}
            theme="borderless"
            type="danger"
            onClick={deleteActive}
            disabled={!activeObject}
          />
        </Tooltip>
      </div>
    </div>
  )
}
