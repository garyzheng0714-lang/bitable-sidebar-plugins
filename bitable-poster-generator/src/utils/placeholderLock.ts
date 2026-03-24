interface LockableObject {
  placeholderLocked?: boolean
}

export function isLocked(obj: LockableObject): boolean {
  return obj.placeholderLocked === true
}

export function applyLockState(locked: boolean): Record<string, boolean> {
  return {
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    hasControls: !locked,
    placeholderLocked: locked,
  }
}
