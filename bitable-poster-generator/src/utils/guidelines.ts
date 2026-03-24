import * as fabric from 'fabric'

const SNAP_THRESHOLD = 8
const GUIDELINE_COLOR = '#f5222d'
const GUIDELINE_WIDTH = 1

interface SnapLine {
  orientation: 'horizontal' | 'vertical'
  position: number
}

export function setupGuidelines(canvas: fabric.Canvas) {
  const guidelines: fabric.Line[] = []

  function clearGuidelines() {
    guidelines.forEach((line) => canvas.remove(line))
    guidelines.length = 0
  }

  function drawGuideline(orientation: 'horizontal' | 'vertical', pos: number) {
    const zoom = canvas.getZoom()
    const logicalW = canvas.getWidth() / zoom
    const logicalH = canvas.getHeight() / zoom
    const points: [number, number, number, number] =
      orientation === 'horizontal'
        ? [0, pos, logicalW, pos]
        : [pos, 0, pos, logicalH]

    const line = new fabric.Line(points, {
      stroke: GUIDELINE_COLOR,
      strokeWidth: GUIDELINE_WIDTH,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    })
    canvas.add(line)
    canvas.bringObjectToFront(line)
    guidelines.push(line)
  }

  canvas.on('object:moving', (e) => {
    const target = e.target
    if (!target) return
    clearGuidelines()

    const zoom = canvas.getZoom()
    const canvasW = canvas.getWidth() / zoom
    const canvasH = canvas.getHeight() / zoom
    const bound = target.getBoundingRect()

    const objCenterX = bound.left + bound.width / 2
    const objCenterY = bound.top + bound.height / 2
    const canvasCenterX = canvasW / 2
    const canvasCenterY = canvasH / 2

    const snaps: SnapLine[] = []

    // canvas center snap
    if (Math.abs(objCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      target.set('left', canvasCenterX - bound.width / 2 + (target.left! - bound.left))
      snaps.push({ orientation: 'vertical', position: canvasCenterX })
    }
    if (Math.abs(objCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      target.set('top', canvasCenterY - bound.height / 2 + (target.top! - bound.top))
      snaps.push({ orientation: 'horizontal', position: canvasCenterY })
    }

    // edge snap (canvas edges)
    if (Math.abs(bound.left) < SNAP_THRESHOLD) {
      target.set('left', target.left! - bound.left)
      snaps.push({ orientation: 'vertical', position: 0 })
    }
    if (Math.abs(bound.top) < SNAP_THRESHOLD) {
      target.set('top', target.top! - bound.top)
      snaps.push({ orientation: 'horizontal', position: 0 })
    }
    if (Math.abs(bound.left + bound.width - canvasW) < SNAP_THRESHOLD) {
      target.set('left', target.left! + (canvasW - bound.left - bound.width))
      snaps.push({ orientation: 'vertical', position: canvasW })
    }
    if (Math.abs(bound.top + bound.height - canvasH) < SNAP_THRESHOLD) {
      target.set('top', target.top! + (canvasH - bound.top - bound.height))
      snaps.push({ orientation: 'horizontal', position: canvasH })
    }

    // snap to other objects
    canvas.getObjects().forEach((obj) => {
      if (obj === target || guidelines.includes(obj as fabric.Line)) return
      if ((obj as any).excludeFromExport) return

      const otherBound = obj.getBoundingRect()
      const otherCenterX = otherBound.left + otherBound.width / 2
      const otherCenterY = otherBound.top + otherBound.height / 2

      // center-to-center
      if (Math.abs(objCenterX - otherCenterX) < SNAP_THRESHOLD) {
        target.set('left', otherCenterX - bound.width / 2 + (target.left! - bound.left))
        snaps.push({ orientation: 'vertical', position: otherCenterX })
      }
      if (Math.abs(objCenterY - otherCenterY) < SNAP_THRESHOLD) {
        target.set('top', otherCenterY - bound.height / 2 + (target.top! - bound.top))
        snaps.push({ orientation: 'horizontal', position: otherCenterY })
      }

      // edge-to-edge
      if (Math.abs(bound.left - otherBound.left) < SNAP_THRESHOLD) {
        target.set('left', target.left! + (otherBound.left - bound.left))
        snaps.push({ orientation: 'vertical', position: otherBound.left })
      }
      if (Math.abs(bound.left + bound.width - (otherBound.left + otherBound.width)) < SNAP_THRESHOLD) {
        target.set('left', target.left! + (otherBound.left + otherBound.width - bound.left - bound.width))
        snaps.push({ orientation: 'vertical', position: otherBound.left + otherBound.width })
      }
      if (Math.abs(bound.top - otherBound.top) < SNAP_THRESHOLD) {
        target.set('top', target.top! + (otherBound.top - bound.top))
        snaps.push({ orientation: 'horizontal', position: otherBound.top })
      }
      if (Math.abs(bound.top + bound.height - (otherBound.top + otherBound.height)) < SNAP_THRESHOLD) {
        target.set('top', target.top! + (otherBound.top + otherBound.height - bound.top - bound.height))
        snaps.push({ orientation: 'horizontal', position: otherBound.top + otherBound.height })
      }
    })

    snaps.forEach((s) => drawGuideline(s.orientation, s.position))
    target.setCoords()
  })

  canvas.on('object:modified', clearGuidelines)
  canvas.on('mouse:up', clearGuidelines)

  return clearGuidelines
}
