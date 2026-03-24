import { useCallback, useEffect, useRef } from 'react'
import type { useCanvas } from '../../hooks/useCanvas'

interface CanvasEditorProps {
  canvasHook: ReturnType<typeof useCanvas>
}

export function CanvasEditor({ canvasHook }: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const initialized = useRef(false)

  const { initCanvas, fitToContainer } = canvasHook

  useEffect(() => {
    if (canvasElRef.current && !initialized.current) {
      initialized.current = true
      initCanvas(canvasElRef.current)
    }
    return () => {
      initialized.current = false
    }
  }, [initCanvas])

  useEffect(() => {
    fitToContainer()
  }, [fitToContainer])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const type = e.dataTransfer.getData('placeholder-type')
      const canvas = canvasHook.canvas
      const rect = canvas?.upperCanvasEl.getBoundingClientRect()
      const zoom = canvas?.getZoom() || 1
      const point = rect
        && e.clientX >= rect.left
        && e.clientX <= rect.right
        && e.clientY >= rect.top
        && e.clientY <= rect.bottom
        ? {
            x: (e.clientX - rect.left) / zoom,
            y: (e.clientY - rect.top) / zoom,
          }
        : undefined

      if (type === 'text') canvasHook.addTextPlaceholder(point)
      if (type === 'image') canvasHook.addImagePlaceholder(point)
      if (type === 'logo') canvasHook.addLogoPlaceholder(point)
      if (type === 'qrcode') canvasHook.addQrCodePlaceholder(point)
    },
    [canvasHook],
  )

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <canvas ref={canvasElRef} />
    </div>
  )
}
