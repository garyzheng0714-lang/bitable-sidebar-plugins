import { describe, it, expect } from 'vitest'
import { applyLockState, isLocked } from './placeholderLock'

describe('isLocked', () => {
  it('returns false when placeholderLocked is undefined', () => {
    expect(isLocked({})).toBe(false)
  })

  it('returns false when placeholderLocked is false', () => {
    expect(isLocked({ placeholderLocked: false })).toBe(false)
  })

  it('returns true when placeholderLocked is true', () => {
    expect(isLocked({ placeholderLocked: true })).toBe(true)
  })
})

describe('applyLockState', () => {
  it('returns lock properties when locking', () => {
    const result = applyLockState(true)

    expect(result.lockMovementX).toBe(true)
    expect(result.lockMovementY).toBe(true)
    expect(result.lockScalingX).toBe(true)
    expect(result.lockScalingY).toBe(true)
    expect(result.lockRotation).toBe(true)
    expect(result.hasControls).toBe(false)
    expect(result.placeholderLocked).toBe(true)
  })

  it('returns unlock properties when unlocking', () => {
    const result = applyLockState(false)

    expect(result.lockMovementX).toBe(false)
    expect(result.lockMovementY).toBe(false)
    expect(result.lockScalingX).toBe(false)
    expect(result.lockScalingY).toBe(false)
    expect(result.lockRotation).toBe(false)
    expect(result.hasControls).toBe(true)
    expect(result.placeholderLocked).toBe(false)
  })

  it('locked objects remain selectable', () => {
    const result = applyLockState(true)

    // Locked objects should still be selectable (for unlocking via UI)
    expect(result).not.toHaveProperty('selectable')
    expect(result).not.toHaveProperty('evented')
  })
})
