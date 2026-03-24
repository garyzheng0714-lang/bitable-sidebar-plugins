import { useEffect, useState, useCallback, useRef } from 'react'
import { bitable, FieldType, IFieldMeta } from '@lark-base-open/js-sdk'
import { md5 } from 'js-md5'
import SHA1 from 'crypto-js/sha1'
import SHA256 from 'crypto-js/sha256'
import SHA512 from 'crypto-js/sha512'
import HmacSHA256 from 'crypto-js/hmac-sha256'
import Hex from 'crypto-js/enc-hex'
import Utf8 from 'crypto-js/enc-utf8'
import CJBase64 from 'crypto-js/enc-base64'
import { sm3 } from 'sm-crypto'
import SearchSelect from './SearchSelect'

type AlgorithmId = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'sm3' | 'base64' | 'hmac-sha256'
interface AlgorithmDef {
  id: AlgorithmId; label: string; description: string
  needsKey: boolean; bidirectional: boolean
  transform: (text: string, opts?: { key?: string; direction?: 'encode' | 'decode' }) => string
}

const ALGORITHMS: AlgorithmDef[] = [
  { id: 'md5', label: 'MD5', description: 'MD5 哈希（大写）', needsKey: false, bidirectional: false, transform: t => md5(t).toUpperCase() },
  { id: 'sha1', label: 'SHA-1', description: 'SHA-1 哈希（大写）', needsKey: false, bidirectional: false, transform: t => SHA1(t).toString(Hex).toUpperCase() },
  { id: 'sha256', label: 'SHA-256', description: 'SHA-256 哈希（大写）', needsKey: false, bidirectional: false, transform: t => SHA256(t).toString(Hex).toUpperCase() },
  { id: 'sha512', label: 'SHA-512', description: 'SHA-512 哈希（大写）', needsKey: false, bidirectional: false, transform: t => SHA512(t).toString(Hex).toUpperCase() },
  { id: 'sm3', label: 'SM3（国密）', description: 'SM3 国密哈希（大写）', needsKey: false, bidirectional: false, transform: t => sm3(t).toUpperCase() },
  { id: 'base64', label: 'Base64', description: 'Base64 编码/解码', needsKey: false, bidirectional: true,
    transform: (t, o) => { if (o?.direction === 'decode') { try { return Utf8.stringify(CJBase64.parse(t)) } catch { return '[解码失败]' } } return CJBase64.stringify(Utf8.parse(t)) } },
  { id: 'hmac-sha256', label: 'HMAC-SHA256', description: 'HMAC-SHA256 签名（大写）', needsKey: true, bidirectional: false, transform: (t, o) => HmacSHA256(t, o?.key || '').toString(Hex).toUpperCase() },
]

type Status = { type: 'idle' | 'loading' | 'success' | 'error'; msg: string }
type Progress = { scanned: number; encrypted: number; failed: number; total: number }
const PAGE_SIZE = 200
const MAX_PAGES = 5000
const MAX_RETRY = 3
const READ_BATCH_SIZE = 1000
const WRITE_BATCH_SIZE = 80
const WRITE_DELAY_MS = 120
const PROGRESS_STEP = 20
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

async function runWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try { return await fn() } catch (e: any) { if (attempt === MAX_RETRY) throw e; await sleep(1000 * Math.pow(2, attempt - 1)) }
  }
  throw new Error('重试失败')
}

async function setRecordsStable(table: any, records: any[]): Promise<{ written: number; failed: number; firstErrorMsg: string }> {
  const queue: any[][] = [records]
  let written = 0
  let failed = 0
  let firstErrorMsg = ''

  while (queue.length > 0) {
    const batch = queue.shift()!
    if (!batch || batch.length === 0) continue
    try {
      await runWithRetry(() => table.setRecords(batch))
      written += batch.length
    } catch (e: any) {
      if (batch.length === 1) {
        failed++
        if (!firstErrorMsg) firstErrorMsg = `写入失败示例：${e?.message ?? '未知错误'}`
      } else {
        const mid = Math.floor(batch.length / 2)
        queue.unshift(batch.slice(mid))
        queue.unshift(batch.slice(0, mid))
      }
    }
  }

  return { written, failed, firstErrorMsg }
}

async function getRecordIdPageSafe(table: any, params: { pageSize: number; pageToken?: number; viewId?: string }): Promise<{ total: number; hasMore: boolean; pageToken?: number; recordIds: string[] }> {
  try {
    const resp: any = await runWithRetry(() => table.getRecordIdListByPage(params))
    return { total: resp.total, hasMore: resp.hasMore, pageToken: resp.hasMore ? (resp.pageToken as number) : undefined, recordIds: resp.recordIds ?? [] }
  } catch (e: any) {
    console.warn('[加密助手] getRecordIdListByPage 失败，回退 getRecordsByPage：', e?.message ?? e)
    const resp: any = await runWithRetry(() => table.getRecordsByPage({ ...params, stringValue: false }))
    return { total: resp.total, hasMore: resp.hasMore, pageToken: resp.hasMore ? (resp.pageToken as number) : undefined, recordIds: (resp.records ?? []).map((r: any) => r.recordId) }
  }
}

const INPUT_TYPES = [FieldType.Text, FieldType.Url, FieldType.Phone, FieldType.Email, FieldType.Formula, FieldType.AutoNumber, FieldType.Barcode]

function cellToText(cell: any): string {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'boolean') return String(cell)
  if (typeof cell === 'number') return String(cell)
  if (typeof cell === 'string') return cell
  if (typeof cell === 'bigint') return String(cell)
  if (Array.isArray(cell)) {
    const joined = cell.map((seg: any) => cellToText(seg)).join('')
    // 数组非空但所有元素都解析为空 → 用 JSON 序列化兜底，确保不会误判为"空值"
    if (!joined && cell.length > 0) return JSON.stringify(cell)
    return joined
  }
  if (typeof cell === 'object') {
    const candidate = cell.text ?? cell.value ?? cell.name ?? cell.enName ?? cell.en_name ?? cell.link ?? cell.address
    if (candidate !== null && candidate !== undefined) return cellToText(candidate)
    // 某些自计算字段会返回 { value: null, status: 'completed' }，应视为真正空值
    if ('value' in cell && (cell.value === null || cell.value === undefined)) return ''
    return JSON.stringify(cell)
  }
  return String(cell)
}

export default function App() {
  const [fields, setFields] = useState<IFieldMeta[]>([])
  const [algorithmId, setAlgorithmId] = useState<AlgorithmId>('md5')
  const [inputFieldId, setInputFieldId] = useState('')
  const [outputFieldId, setOutputFieldId] = useState('')
  const [hmacKey, setHmacKey] = useState('')
  const [base64Direction, setBase64Direction] = useState<'encode' | 'decode'>('encode')
  const [status, setStatus] = useState<Status>({ type: 'idle', msg: '' })
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)
  const runningRef = useRef(false)
  const selectedAlgo = ALGORITHMS.find(a => a.id === algorithmId)!

  const loadFields = useCallback(async () => {
    try { const table = await bitable.base.getActiveTable(); setFields(await table.getFieldMetaList()); setReady(true) }
    catch { setStatus({ type: 'error', msg: '无法获取字段列表，请确认插件已在多维表格中运行' }) }
  }, [])

  useEffect(() => { const dispose = bitable.base.onSelectionChange(() => loadFields()); loadFields(); return () => { dispose?.() } }, [loadFields])

  const handleEncrypt = async () => {
    if (runningRef.current) return
    if (!inputFieldId) { setStatus({ type: 'error', msg: '请选择输入字段' }); return }
    if (!outputFieldId) { setStatus({ type: 'error', msg: '请选择输出字段' }); return }
    if (inputFieldId === outputFieldId) { setStatus({ type: 'error', msg: '输入字段和输出字段不能相同' }); return }
    if (selectedAlgo.needsKey && !hmacKey.trim()) { setStatus({ type: 'error', msg: '请输入密钥（HMAC-SHA256 需要密钥）' }); return }

    runningRef.current = true
    setStatus({ type: 'loading', msg: '处理中...' })
    setProgress(null)
    const transformOpts = { key: hmacKey, direction: base64Direction }

    try {
      const table = await bitable.base.getActiveTable()
      const view = await table.getActiveView()
      const viewId = view.id

      // ── 阶段 1：仅分页读取 recordId，避免读写交替导致分页错乱 ──
      const firstPage = await getRecordIdPageSafe(table, { pageSize: PAGE_SIZE, viewId })
      const total = firstPage.total
      if (total === 0) { setStatus({ type: 'error', msg: '当前视图没有记录' }); return }
      const updatePrepareStatus = (locked: number) => setStatus({ type: 'loading', msg: `正在准备记录... ${locked}/${total}` })

      const recordIds: string[] = [...firstPage.recordIds]
      let fetched = firstPage.recordIds.length
      updatePrepareStatus(fetched)
      setProgress({ scanned: 0, encrypted: 0, failed: 0, total })

      let pageToken = firstPage.hasMore ? (firstPage.pageToken as number) : undefined
      let pageCount = 1
      while (pageToken !== undefined && pageCount < MAX_PAGES) {
        const resp = await getRecordIdPageSafe(table, { pageSize: PAGE_SIZE, pageToken, viewId })
        recordIds.push(...resp.recordIds)
        fetched += resp.recordIds.length
        if (pageCount % 10 === 0 || fetched === total) updatePrepareStatus(fetched)
        pageToken = resp.hasMore ? (resp.pageToken as number) : undefined
        pageCount++
      }

      // 去重保护：避免极端情况下分页重复导致重复写入
      const uniqueRecordIds = Array.from(new Set(recordIds))
      setStatus({ type: 'loading', msg: '处理中...' })
      setProgress({ scanned: 0, encrypted: 0, failed: 0, total: uniqueRecordIds.length })

      // ── 阶段 2：批量读取 + 稳定批量写入（失败自动拆批） ──
      let scanned = 0, encrypted = 0, failedRead = 0, failedWrite = 0, skippedEmpty = 0
      let firstSkippedRaw: any = null // 诊断：记录第一条被跳过的原始值
      let firstFailureMsg = ''
      const totalRecords = uniqueRecordIds.length
      let pendingWrites: any[] = []
      let flushCount = 0
      const flushProgress = (force = false) => {
        if (!force && scanned % PROGRESS_STEP !== 0 && scanned !== totalRecords) return
        setProgress({ scanned, encrypted, failed: failedRead + failedWrite, total: totalRecords })
      }

      const flushWrites = async () => {
        if (pendingWrites.length === 0) return
        const batch = pendingWrites
        pendingWrites = []
        if (flushCount > 0) await sleep(WRITE_DELAY_MS)
        flushCount++
        const result = await setRecordsStable(table, batch)
        encrypted += result.written
        failedWrite += result.failed
        if (!firstFailureMsg && result.firstErrorMsg) firstFailureMsg = result.firstErrorMsg
      }

      for (let i = 0; i < uniqueRecordIds.length; i += READ_BATCH_SIZE) {
        const readIds = uniqueRecordIds.slice(i, i + READ_BATCH_SIZE)
        let records: any[]
        try {
          records = await runWithRetry(() => table.getRecordsByIds(readIds))
        } catch (e: any) {
          failedRead += readIds.length
          scanned += readIds.length
          if (!firstFailureMsg) firstFailureMsg = `读取失败示例：${e?.message ?? '未知错误'}`
          flushProgress(true)
          continue
        }
        if (records.length !== readIds.length) {
          console.warn(`[加密助手] 批量读取返回数量异常：请求 ${readIds.length} 条，返回 ${records.length} 条，将对缺失项做单条回退读取。`)
        }

        for (let j = 0; j < readIds.length; j++) {
          const recordId = readIds[j]
          let raw = records?.[j]?.fields?.[inputFieldId]
          // 批量读取未命中时，回退单条读取，避免把“未加载/未返回”误判为空值
          if (raw === undefined) {
            try {
              raw = await runWithRetry(() => table.getCellValue(inputFieldId, recordId))
            } catch (e: any) {
              failedRead++
              scanned++
              if (!firstFailureMsg) firstFailureMsg = `读取失败示例：${e?.message ?? '未知错误'}`
              flushProgress()
              continue
            }
          }
          const text = cellToText(raw)

          if (text.length === 0) {
            skippedEmpty++
            if (firstSkippedRaw === null) firstSkippedRaw = raw
            scanned++
            flushProgress()
            continue
          }

          try {
            const transformed = selectedAlgo.transform(text, transformOpts)
            pendingWrites.push({ recordId, fields: { [outputFieldId]: [{ type: 'text', text: transformed }] } })
            if (pendingWrites.length >= WRITE_BATCH_SIZE) await flushWrites()
          } catch (e: any) {
            failedWrite++
            if (!firstFailureMsg) firstFailureMsg = `写入失败示例：${e?.message ?? '未知错误'}`
          }

          scanned++
          flushProgress()
        }
        // 让出事件循环，降低长时间任务造成的 UI 卡顿
        await sleep(0)
      }

      await flushWrites()

      flushProgress(true)

      if (firstSkippedRaw !== null) {
        try {
          console.warn('[加密助手] 首条被跳过记录的原始值：', JSON.stringify(firstSkippedRaw), '类型:', typeof firstSkippedRaw, Array.isArray(firstSkippedRaw) ? '(Array)' : '')
        } catch {
          console.warn('[加密助手] 首条被跳过记录的原始值无法序列化，类型:', typeof firstSkippedRaw)
        }
      }

      const failed = failedRead + failedWrite
      // 结果消息
      const parts: string[] = [`已处理 ${encrypted} 条`]
      if (skippedEmpty > 0) parts.push(`跳过空值 ${skippedEmpty} 条`)
      if (failedRead > 0) parts.push(`读取失败 ${failedRead} 条`)
      if (failedWrite > 0) parts.push(`写入失败 ${failedWrite} 条（可重新运行补全）`)
      if (fetched < total) parts.push(`注意：仅读取到 ${fetched}/${total} 条`)
      if (uniqueRecordIds.length < fetched) parts.push(`去重 ${fetched - uniqueRecordIds.length} 条重复记录`)

      // 如果跳过比例异常高，在控制台输出诊断信息
      if (skippedEmpty > 0 && skippedEmpty > encrypted) {
        console.warn(`[加密助手] 警告：跳过 ${skippedEmpty} 条，仅处理 ${encrypted} 条。首条被跳过的原始值已打印在上方。请检查输入字段是否有计算中或权限受限情况。`)
      }
      if (firstFailureMsg) {
        console.warn(`[加密助手] ${firstFailureMsg}`)
      }

      if (encrypted === 0 && failed === 0) setStatus({ type: 'error', msg: '输入字段全部为空，没有可处理的记录' })
      else if (failed > 0) setStatus({ type: 'error', msg: parts.join('，') })
      else setStatus({ type: 'success', msg: `完成！${parts.join('，')}` })
      setProgress(null)
    } catch (e: any) { setStatus({ type: 'error', msg: e?.message ?? '处理失败，请重试' }); setProgress(null) }
    finally { runningRef.current = false }
  }

  const inputCompatible = fields.filter(f => INPUT_TYPES.includes(f.type as any))
  const outputCompatible = fields.filter(f => f.type === FieldType.Text)
  const isLoading = status.type === 'loading'
  const pct = progress ? (progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0) : 0
  const arrowText = algorithmId === 'base64' ? (base64Direction === 'encode' ? 'Base64 编码' : 'Base64 解码') : selectedAlgo.description

  return (
    <div style={s.page}>
      <div style={s.header}>
        <img src="https://fbif-feishu-base.oss-cn-shanghai.aliyuncs.com/fbif-attachment-to-url/2026/03/tblMQeXvSGd7Hebf_64441f85vYBjZN6VXlZ7mA_1773986737516/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20260320133605_1541_594_1773986737699.png" alt="logo" style={s.logo} />
        <div style={s.headerText}>
          <span style={s.title}>加密助手</span>
          <span style={s.subtitle}>选择算法、字段后稳定处理</span>
        </div>
      </div>

      {!ready && status.type !== 'error' && <div style={s.hint}>初始化中...</div>}
      {status.type === 'error' && !ready && <div style={{ ...s.toast, ...s.toastError }}>{status.msg}</div>}

      {ready && (<>
        <div style={s.field}>
          <label style={s.label}><span style={s.labelDot} /> 加密算法</label>
          <SearchSelect options={ALGORITHMS.map(a => ({ value: a.id, label: a.label }))} value={algorithmId} onChange={v => setAlgorithmId(v as AlgorithmId)} placeholder="选择算法..." disabled={isLoading} />
        </div>

        <div style={s.field}>
          <label style={s.label}><span style={s.labelDot} /> 输入字段</label>
          <SearchSelect options={inputCompatible.map(f => ({ value: f.id, label: f.name }))} value={inputFieldId} onChange={setInputFieldId} disabled={isLoading} />
        </div>

        {algorithmId === 'hmac-sha256' && (
          <div style={s.field}>
            <label style={s.label}><span style={{ ...s.labelDot, background: '#FF7D00' }} /> 密钥 (Secret Key)</label>
            <input type="text" value={hmacKey} onChange={e => setHmacKey(e.target.value)} placeholder="请输入 HMAC 密钥..." disabled={isLoading} style={s.textInput} />
          </div>
        )}

        {algorithmId === 'base64' && (
          <div style={s.field}>
            <label style={s.label}><span style={{ ...s.labelDot, background: '#FF7D00' }} /> 操作方向</label>
            <div style={s.toggleRow}>
              <button style={{ ...s.toggleBtn, ...(base64Direction === 'encode' ? s.toggleActive : {}) }} onClick={() => setBase64Direction('encode')} disabled={isLoading}>编码 (Encode)</button>
              <button style={{ ...s.toggleBtn, ...(base64Direction === 'decode' ? s.toggleActive : {}) }} onClick={() => setBase64Direction('decode')} disabled={isLoading}>解码 (Decode)</button>
            </div>
          </div>
        )}

        <div style={s.arrowRow}>
          <div style={s.arrowLine} /><span style={s.arrowIcon}>↓</span><div style={s.arrowLabel}>{arrowText}</div><div style={s.arrowLine} />
        </div>

        <div style={s.field}>
          <label style={s.label}><span style={{ ...s.labelDot, background: '#FFC300' }} /> 输出字段</label>
          <SearchSelect options={outputCompatible.map(f => ({ value: f.id, label: f.name }))} value={outputFieldId} onChange={setOutputFieldId} disabled={isLoading} />
        </div>

        <button style={{ ...s.btn, ...(isLoading ? s.btnDisabled : {}) }} onClick={handleEncrypt} disabled={isLoading}>
          {isLoading ? '处理中...' : '开始处理'}
        </button>

        {progress && (
          <div style={s.progressBox}>
            <div style={s.progressTop}><span style={s.progressLabel}>处理进度</span><span style={s.progressPct}>{pct}%</span></div>
            <div style={s.track}><div style={{ ...s.bar, width: `${pct}%` }} /></div>
            <div style={s.progressDetail}>
              <span>已写入 {progress.encrypted} 条</span><span style={s.progressSep}>·</span><span>已扫描 {progress.scanned} / {progress.total} 条</span>
              {progress.failed > 0 && <><span style={s.progressSep}>·</span><span style={s.progressFailed}>失败 {progress.failed} 条</span></>}
            </div>
          </div>
        )}

        {status.msg && !progress && status.type !== 'idle' && (
          <div style={{ ...s.toast, ...(status.type === 'success' ? s.toastSuccess : {}), ...(status.type === 'error' ? s.toastError : {}), ...(status.type === 'loading' ? s.toastLoading : {}) }}>
            {status.type === 'success' && <span style={s.toastIcon}>✓</span>}
            {status.type === 'error' && <span style={s.toastIcon}>!</span>}
            {status.msg}
          </div>
        )}
      </>)}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 14, color: '#1a1a1a', background: '#fff', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: '2px solid #FFC300' },
  logo: { width: 40, height: 40, borderRadius: 8, flexShrink: 0, objectFit: 'cover' },
  headerText: { display: 'flex', flexDirection: 'column', gap: 2 },
  title: { fontSize: 16, fontWeight: 700, color: '#1677FF', letterSpacing: 0.5 },
  subtitle: { fontSize: 11, color: '#999' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', gap: 5 },
  labelDot: { width: 6, height: 6, borderRadius: '50%', background: '#1677FF', display: 'inline-block', flexShrink: 0 },
  textInput: { width: '100%', height: 36, padding: '0 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fafafa', fontSize: 13, color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' },
  toggleRow: { display: 'flex', gap: 8 },
  toggleBtn: { flex: 1, height: 32, border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fafafa', fontSize: 12, fontWeight: 500, color: '#555', cursor: 'pointer', fontFamily: 'inherit' },
  toggleActive: { borderColor: '#1677FF', background: '#f0f6ff', color: '#1677FF', fontWeight: 600 },
  arrowRow: { display: 'flex', alignItems: 'center', gap: 6, margin: '-4px 0' },
  arrowLine: { flex: 1, height: 1, background: '#f0f0f0' },
  arrowIcon: { fontSize: 14, color: '#1677FF', lineHeight: 1 },
  arrowLabel: { fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' },
  btn: { width: '100%', height: 40, background: 'linear-gradient(135deg, #1677FF 0%, #0a5fd4 100%)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5, boxShadow: '0 2px 8px rgba(22,119,255,0.3)', marginTop: 2 },
  btnDisabled: { background: '#c5d5f0', boxShadow: 'none', cursor: 'not-allowed' },
  progressBox: { borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' },
  progressTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px 4px' },
  progressLabel: { fontSize: 12, fontWeight: 600, color: '#555' },
  progressPct: { fontSize: 13, fontWeight: 700, color: '#1677FF' },
  track: { height: 4, background: '#f0f0f0' },
  bar: { height: '100%', background: '#1677FF', transition: 'width 0.3s ease' },
  progressDetail: { display: 'flex', alignItems: 'center', fontSize: 11, color: '#999', padding: '5px 12px 8px', flexWrap: 'wrap', gap: 0 },
  progressSep: { margin: '0 4px', color: '#ccc' },
  progressFailed: { color: '#c8281f' },
  toast: { padding: '9px 12px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.5 },
  toastIcon: { fontWeight: 700, fontSize: 13, flexShrink: 0 },
  toastSuccess: { background: '#f0faf3', color: '#1a8a35', border: '1px solid #b7e8c4' },
  toastError: { background: '#fff2f0', color: '#c8281f', border: '1px solid #ffc9c5' },
  toastLoading: { background: '#f0f6ff', color: '#1677FF', border: '1px solid #d0e4ff' },
  hint: { fontSize: 12, color: '#aaa' },
}
