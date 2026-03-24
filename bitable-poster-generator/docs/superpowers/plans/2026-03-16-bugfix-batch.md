# Bitable Poster Generator - 批量 Bug 修复计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 bugs: lookup field binding, preview image duplication, delete crash, view filter support, attachment overwrite, silent write failures, and bottom panel overflow.

**Architecture:** All fixes are frontend-only. Data layer fixes (useBitable hook) address field filtering, view-aware pagination, and attachment append logic. Canvas layer fixes (useCanvas hook) address preview race conditions and delete safety. UI fix (CSS) addresses bottom panel visibility.

**Tech Stack:** React 18, TypeScript, Fabric.js v6, @lark-base-open/js-sdk, Semi Design

---

## File Structure

| File | Responsibility | Changes |
|------|---------------|---------|
| `src/hooks/useBitable.ts` | Bitable SDK data layer | Add Lookup type, view-aware pagination, attachment append |
| `src/hooks/useCanvas.ts` | Canvas editing & preview | Fix preview race condition, fix delete with preview cleanup |
| `src/components/UnifiedPanel/index.tsx` | Main UI panel | Improve error feedback |
| `src/components/GeneratePanel/index.tsx` | Legacy generate panel | Improve error feedback |
| `src/App.css` | Global styles | Fix bottom panel overflow |

---

## Chunk 1: Data Layer Fixes

### Task 1: Add Lookup Field Type to Text-Compatible Whitelist

**Files:**
- Modify: `src/hooks/useBitable.ts:12-28` (TEXT_COMPATIBLE_TYPES)

**Root cause:** `FieldType.Lookup` (enum value 19) is not in `TEXT_COMPATIBLE_TYPES`, so lookup fields are invisible in the field binding dropdown. The `getCellText` function already handles arrays and objects, so lookup values will render correctly once the field is discoverable.

- [ ] **Step 1: Add FieldType.Lookup to TEXT_COMPATIBLE_TYPES**

In `src/hooks/useBitable.ts`, add `FieldType.Lookup` to the `TEXT_COMPATIBLE_TYPES` Set:

```typescript
const TEXT_COMPATIBLE_TYPES = new Set([
  FieldType.Text,
  FieldType.Number,
  FieldType.DateTime,
  FieldType.Phone,
  FieldType.Url,
  FieldType.Email,
  FieldType.Barcode,
  FieldType.AutoNumber,
  FieldType.Currency,
  FieldType.Rating,
  FieldType.SingleSelect,
  FieldType.MultiSelect,
  FieldType.Formula,
  FieldType.CreatedTime,
  FieldType.ModifiedTime,
  FieldType.Lookup,        // 查找引用字段
])
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/simba/local_vibecoding/bitable-poster-generator && npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useBitable.ts
git commit -m "fix: add Lookup field type to text-compatible whitelist"
```

---

### Task 2: View-Aware Record Fetching with Pagination

**Files:**
- Modify: `src/hooks/useBitable.ts:37-115` (add ref, modify loadTable, replace getRecordIds)

**Root cause:** `table.getRecordIdList()` ignores the current view's filter/sort and is deprecated (max 200 records). When a user filters a view to 10 rows, generation still processes ALL rows in the table.

**Fix:** Use `table.getRecordIdListByPage({ viewId })` with the active view ID from `bitable.base.getSelection()`. Paginate to collect all matching record IDs.

- [ ] **Step 1: Store viewId in hook state**

Add a `viewId` ref alongside the existing `currentTableIdRef` (after line 37):

```typescript
const currentViewIdRef = useRef<string | null>(null)
```

In `loadTable`, right after getting the selection (after line 49), capture the viewId:

```typescript
currentViewIdRef.current = selection?.viewId ?? null
```

- [ ] **Step 2: Replace getRecordIds with paginated view-aware version**

Replace the current `getRecordIds` (lines 112-115):

```typescript
const getRecordIds = useCallback(async (): Promise<string[]> => {
  if (!table) return []
  const allIds: string[] = []
  let pageToken: number | undefined  // SDK PageToken is number, not string

  do {
    const resp = await table.getRecordIdListByPage({
      pageSize: 200,
      pageToken,
      viewId: currentViewIdRef.current ?? undefined,
    })
    allIds.push(...resp.recordIds)
    pageToken = resp.hasMore ? resp.pageToken : undefined
  } while (pageToken)

  return allIds
}, [table])
```

**Note:** The SDK defines `PageToken = number`. Using `number | undefined` here, NOT `string | undefined`.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors. The `getRecordIdListByPage` method accepts `{ pageSize, pageToken, viewId }` per SDK types at `index.d.ts:1734-1738`.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useBitable.ts
git commit -m "fix: use view-aware paginated record fetching instead of deprecated getRecordIdList"
```

---

### Task 3: Fix Attachment Write - Append Instead of Overwrite + Error Reporting

**Files:**
- Modify: `src/hooks/useBitable.ts:167-181` (writeAttachment)
- Modify: `src/components/UnifiedPanel/index.tsx:222-225` (handleGenerate toast)
- Modify: `src/components/GeneratePanel/index.tsx:148-153` (handleGenerate toast)

**Root cause:** `field.setValue(recordId, file)` replaces ALL existing attachments in the cell. When generating 4 posters, each write overwrites the previous one, leaving only the last poster. Also, write failures are caught silently - progress shows 100% but nothing is actually written.

**Fix:**
1. Read existing attachments first, then write combined array (existing + new).
2. Surface write failure count to user.

- [ ] **Step 1: Implement append-mode writeAttachment**

Replace the `writeAttachment` callback in `useBitable.ts`:

```typescript
const writeAttachment = useCallback(
  async (fieldId: string, recordId: string, blob: Blob, filename: string): Promise<boolean> => {
    if (!table) return false
    try {
      const field = await table.getFieldById(fieldId)

      // Read existing attachments to preserve them
      let existing: any[] = []
      try {
        const currentVal = await field.getValue(recordId)
        if (Array.isArray(currentVal)) {
          existing = currentVal
        }
      } catch {
        // No existing value, start fresh
      }

      const file = new File([blob], filename, { type: blob.type || 'image/png' })

      // SDK setValue accepts mixed [IOpenAttachment, File] at runtime
      // despite AttachmentTransformVal typed as union (File[] | IOpenAttachment[]).
      // The SDK internally serializes IOpenAttachment tokens and File blobs separately.
      const combined = [...existing, file]
      await (field as any).setValue(recordId, combined)
      return true
    } catch (err) {
      console.error('writeAttachment failed', fieldId, recordId, err)
      return false
    }
  },
  [table],
)
```

- [ ] **Step 2: Add error count reporting in UnifiedPanel handleGenerate**

In `src/components/UnifiedPanel/index.tsx`, modify the toast after the generation loop (lines 222-225):

```typescript
setGenerating(false)
setGenerationScope(null)
const failCount = recordIds.length - successCount
if (failCount > 0) {
  Toast.warning({ content: `已写入 ${successCount} 张海报，${failCount} 张失败` })
} else {
  Toast.success({ content: `已写入 ${successCount} 张海报到表格` })
}
```

- [ ] **Step 3: Add error count reporting in GeneratePanel handleGenerate**

In `src/components/GeneratePanel/index.tsx`, modify the toast after the generation loop (lines 148-153):

```typescript
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
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBitable.ts src/components/UnifiedPanel/index.tsx src/components/GeneratePanel/index.tsx
git commit -m "fix: append attachments instead of overwriting, report write failures"
```

---

## Chunk 2: Canvas Interaction Fixes

### Task 4: Fix Preview Image Overlay Race Condition

**Files:**
- Modify: `src/hooks/useCanvas.ts:925-1045` (previewRecord)

**Root cause:** `previewRecord` is async and called on every `onSelectionChange`. When selection changes rapidly, multiple concurrent `previewRecord` calls create duplicate image overlays because:
1. Call A starts, calls `clearPreview()` (nothing to clear)
2. Call A begins loading images (takes time)
3. Call B starts, calls `clearPreview()` (nothing in `previewRef` yet since A hasn't finished)
4. Call A finishes, sets `previewRef` with its overlays
5. Call B finishes, sets `previewRef` with ITS overlays (A's overlays are now orphaned on canvas)

This creates ghost images that appear as duplicate avatars/photos.

**Fix:** Add a generation counter. Each `previewRecord` call gets a unique ID. If a newer call starts before the current one finishes, the older call rollbacks its changes (restore text originals, remove image overlays) and exits.

- [ ] **Step 1: Add preview generation counter to useCanvas**

Near the top of the hook (next to `previewRef`), add:

```typescript
const previewGenRef = useRef(0)
```

- [ ] **Step 2: Guard previewRecord with generation counter and rollback**

Replace `previewRecord`. Key differences from current code:
- `previewGenRef` incremented at start
- After each `await`, check if stale (`previewGenRef.current !== gen`)
- On stale detection: **rollback** text changes already made, remove image overlays added, then return
- Final check before committing to `previewRef.current`

```typescript
const previewRecord = useCallback(async (
  recordId: string,
  getter: {
    getCellText: (fieldId: string, recordId: string) => Promise<string>
    getAttachmentUrls: (fieldId: string, recordId: string) => Promise<string[]>
  },
) => {
  const c = canvasRef.current
  if (!c) return

  // Increment generation counter - any older in-flight preview becomes stale
  const gen = ++previewGenRef.current

  // clear any existing preview first
  clearPreview({ skipRender: true })

  skipSaveRef.current = true

  const textOriginals = new Map<string, string>()
  const fontSizeOriginals = new Map<string, number>()
  const imageOverlays: fabric.FabricObject[] = []
  const overlayMap = new Map<string, { img: fabric.FabricImage; imgNaturalW: number; imgNaturalH: number }>()

  const objects = c.getObjects() as PlaceholderObject[]

  // Helper: rollback all changes made so far and exit
  const rollback = () => {
    // Restore text changes
    for (const [phId, originalText] of textOriginals) {
      const phObj = objects.find(o => o.placeholderId === phId) as unknown as TextboxWithBounds | undefined
      if (phObj) {
        phObj.set('text', originalText)
        fitTextboxText(phObj, {
          maxFontSize: fontSizeOriginals.get(phId) ?? Math.round(phObj.fontSize ?? 36),
        })
      }
    }
    // Remove image overlays added so far
    for (const overlay of imageOverlays) {
      c.remove(overlay)
    }
    skipSaveRef.current = false
  }

  for (const obj of objects) {
    // Bail out if a newer preview has started
    if (previewGenRef.current !== gen) { rollback(); return }

    if (!obj.binding || !obj.placeholderId) continue
    const { fieldId } = obj.binding

    if (obj.placeholderType === 'text') {
      const textObj = obj as unknown as TextboxWithBounds
      textOriginals.set(obj.placeholderId, textObj.text)
      fontSizeOriginals.set(
        obj.placeholderId,
        textObj.placeholderFontSizeMax ?? textObj.fontSize ?? 36,
      )
      try {
        const text = await getter.getCellText(fieldId, recordId)
        if (previewGenRef.current !== gen) { rollback(); return }
        fitTextboxText(textObj, {
          text: text || ' ',
          maxFontSize: fontSizeOriginals.get(obj.placeholderId) ?? 36,
        })
      } catch {
        // ignore
      }
    }

    if (obj.placeholderType === 'image') {
      try {
        const urls = await getter.getAttachmentUrls(fieldId, recordId)
        if (previewGenRef.current !== gen) { rollback(); return }
        if (urls.length > 0) {
          const img = await fabric.FabricImage.fromURL(urls[0], { crossOrigin: 'anonymous' })
          if (previewGenRef.current !== gen) { rollback(); return }

          const targetWidth = Math.max(1, obj.getScaledWidth())
          const targetHeight = Math.max(1, obj.getScaledHeight())
          const center = obj.getCenterPoint()
          const left = center.x - targetWidth / 2
          const top = center.y - targetHeight / 2
          const fitMode = obj.placeholderFit ?? 'contain'

          const imgW = img.width!
          const imgH = img.height!

          if (fitMode === 'contain') {
            const sx = targetWidth / imgW
            const sy = targetHeight / imgH
            let scale = Math.min(sx, sy)
            if (obj.placeholderShape === 'circle') {
              const d = Math.min(targetWidth, targetHeight)
              scale = Math.min(scale, d / Math.sqrt(imgW * imgW + imgH * imgH))
            }
            img.set({
              left: left + (targetWidth - imgW * scale) / 2,
              top: top + (targetHeight - imgH * scale) / 2,
              angle: obj.angle ?? 0,
              scaleX: scale,
              scaleY: scale,
            })
          } else {
            const sx = targetWidth / imgW
            const sy = targetHeight / imgH
            const scale = Math.max(sx, sy)
            const cropX = (imgW * scale - targetWidth) / 2 / scale
            const cropY = (imgH * scale - targetHeight) / 2 / scale
            img.set({
              left,
              top,
              angle: obj.angle ?? 0,
              scaleX: scale,
              scaleY: scale,
              cropX,
              cropY,
              width: imgW - cropX * 2,
              height: imgH - cropY * 2,
            })
          }

          if (obj.placeholderShape === 'circle') {
            img.set({
              clipPath: new fabric.Circle({
                radius: Math.min(targetWidth, targetHeight) / 2,
                originX: 'center',
                originY: 'center',
              }),
            })
          }

          ;(img as any)._isPreview = true
          img.set({ selectable: false, evented: false })

          const idx = c.getObjects().indexOf(obj)
          c.insertAt(idx + 1, img)
          imageOverlays.push(img)
          overlayMap.set(obj.placeholderId!, { img, imgNaturalW: imgW, imgNaturalH: imgH })
        }
      } catch {
        // ignore
      }
    }
  }

  // Final check before committing
  if (previewGenRef.current !== gen) {
    rollback()
    return
  }

  previewRef.current = { textOriginals, fontSizeOriginals, imageOverlays, overlayMap }
  skipSaveRef.current = false
  c.renderAll()
}, [clearPreview])
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCanvas.ts
git commit -m "fix: prevent preview image overlay duplication via generation counter with rollback"
```

---

### Task 5: Fix Delete Crash with Preview Cleanup

**Files:**
- Modify: `src/hooks/useCanvas.ts:1047-1055` (deleteActive)

**Root cause:** Deleting a placeholder object while preview is active leaves orphaned image overlays on the canvas. Additionally, if the `activeObject` reference is stale (already removed), `c.remove()` on a non-existent object could cause unexpected behavior.

**Fix:**
1. Validate the object is still on the canvas before removing.
2. Before deleting, clear preview to avoid orphaned overlays.

- [ ] **Step 1: Harden deleteActive**

Replace the `deleteActive` callback:

```typescript
const deleteActive = useCallback(() => {
  const c = canvasRef.current
  if (!c || !activeObject) return

  // Validate object is still on canvas
  if (!c.getObjects().includes(activeObject)) {
    c.discardActiveObject()
    syncActiveObject(null)
    return
  }

  // Clear preview before deleting to avoid orphaned overlays
  if (previewRef.current) {
    clearPreview({ skipRender: true })
  }

  c.remove(activeObject)
  c.discardActiveObject()
  c.renderAll()
  syncActiveObject(null)
}, [activeObject, syncActiveObject, clearPreview])
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCanvas.ts
git commit -m "fix: clear preview and validate object before delete to prevent crash"
```

---

## Chunk 3: UI Fix

### Task 6: Fix Bottom Panel Content Visibility

**Files:**
- Modify: `src/App.css:602-606` (.unified-panel-actions)

**Root cause:** `.bottom-panel` uses `overflow: hidden` which clips content. The `.unified-panel-actions` section (at line 602) has `flex-shrink: 0` but no max-height constraint. When it contains summary text + field selector + progress bar + buttons simultaneously, it can exceed the remaining space after `.unified-panel-list` takes its minimum, and the parent's `overflow: hidden` clips the generate buttons.

**Fix:** Add `max-height` to `.unified-panel-actions` to cap its vertical space. Do NOT add `overflow-y: auto` (that would hide buttons behind a scrollbar, defeating the purpose). Instead, the progress bar is conditionally rendered only during generation, so the max-height is enough. Also do NOT change `.unified-panel-list` min-height (it's already `min-height: 0` which is correct for flex shrinking).

- [ ] **Step 1: Add max-height to unified-panel-actions**

In `src/App.css`, modify `.unified-panel-actions` (line 602-606):

```css
.unified-panel-actions {
  padding: var(--sp-2) var(--sp-3);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
  max-height: 200px;
}
```

- [ ] **Step 2: Also update mobile media query**

In the `@media (max-width: 500px)` block (around line 755), add the same constraint:

```css
.unified-panel-actions {
  padding: var(--sp-1) var(--sp-2);
  max-height: 180px;
}
```

- [ ] **Step 3: Verify visually**

After running `npm run dev`, open the plugin and:
1. Add multiple placeholders to see the list scroll
2. Start generation to see progress bar appears without hiding buttons
3. Verify generate buttons are always accessible

- [ ] **Step 4: Commit**

```bash
git add src/App.css
git commit -m "fix: ensure bottom panel actions are always visible"
```

---

## Summary of All Fixes

| Bug | Root Cause | Fix Location | Approach |
|-----|-----------|--------------|----------|
| 查找引用字段不可见 | `FieldType.Lookup` not in whitelist | `useBitable.ts` L12 | Add to `TEXT_COMPATIBLE_TYPES` |
| 预览图片重影（多头像） | 并发 `previewRecord` 竞态条件 | `useCanvas.ts` L925 | Generation counter + rollback |
| 删除崩溃 | 删除时预览层未清理 + 对象可能已移除 | `useCanvas.ts` L1047 | 删除前清理预览 + 验证对象存在 |
| 不跟踪视图筛选 | `table.getRecordIdList()` 忽略视图 | `useBitable.ts` L112 | 改用 `getRecordIdListByPage({ viewId })` |
| 覆盖已有附件 | `field.setValue` 替换而非追加 | `useBitable.ts` L167 | 先读取已有附件再合并写入 |
| 进度100%但表里没有 | 写入失败被静默吞掉 | `UnifiedPanel` + `GeneratePanel` | 展示失败计数 |
| 底部内容被挡住 | actions 区域无高度限制被 `overflow: hidden` 裁剪 | `App.css` L602 | 限制 actions max-height |
