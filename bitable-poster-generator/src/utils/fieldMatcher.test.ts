import { describe, it, expect } from 'vitest'
import { suggestFieldBinding } from './fieldMatcher'

const textFields = [
  { id: 'f1', name: '姓名', type: 1 },
  { id: 'f2', name: '部门', type: 1 },
  { id: 'f3', name: '职位', type: 1 },
  { id: 'f4', name: '邮箱', type: 1 },
  { id: 'f5', name: '个人简介', type: 1 },
  { id: 'f6', name: 'URL链接', type: 1 },
]

const imageFields = [
  { id: 'f10', name: '头像', type: 17 },
  { id: 'f11', name: '产品图片', type: 17 },
  { id: 'f12', name: '照片', type: 17 },
]

describe('suggestFieldBinding', () => {
  it('matches "姓名" label to field containing "名"', () => {
    const result = suggestFieldBinding('姓名', textFields)

    expect(result?.id).toBe('f1')
  })

  it('matches "Text" default label to nothing (too generic)', () => {
    const result = suggestFieldBinding('Text', textFields)

    expect(result).toBeNull()
  })

  it('matches "头像" label to field containing "头像"', () => {
    const result = suggestFieldBinding('头像', imageFields)

    expect(result?.id).toBe('f10')
  })

  it('matches "Logo" default label to nothing (too generic)', () => {
    const result = suggestFieldBinding('Logo', imageFields)

    expect(result).toBeNull()
  })

  it('matches "QR Code" default label to nothing (too generic)', () => {
    const result = suggestFieldBinding('QR Code', textFields)

    expect(result).toBeNull()
  })

  it('matches "邮箱" label to field containing "邮箱"', () => {
    const result = suggestFieldBinding('邮箱', textFields)

    expect(result?.id).toBe('f4')
  })

  it('matches partial Chinese: "照" to "照片" field', () => {
    const result = suggestFieldBinding('照片区域', imageFields)

    expect(result?.id).toBe('f12')
  })

  it('returns null when no fields match', () => {
    const result = suggestFieldBinding('不存在的字段', textFields)

    expect(result).toBeNull()
  })

  it('returns null for empty field list', () => {
    const result = suggestFieldBinding('姓名', [])

    expect(result).toBeNull()
  })

  it('is case-insensitive for English labels', () => {
    const fields = [{ id: 'f20', name: 'Email', type: 1 }]
    const result = suggestFieldBinding('email', fields)

    expect(result?.id).toBe('f20')
  })

  it('matches "链接" to URL field', () => {
    const result = suggestFieldBinding('链接', textFields)

    expect(result?.id).toBe('f6')
  })
})
