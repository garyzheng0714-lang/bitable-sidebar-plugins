import JSZip from 'jszip'
import { downloadBlob } from '../services/posterGenerator'

export function buildZipFilename(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `posters-${date}-${time}.zip`
}

export function shouldUseZip(recordCount: number): boolean {
  return recordCount > 1
}

export async function downloadAsZip(
  blobs: Array<{ blob: Blob; filename: string }>,
): Promise<void> {
  const zip = new JSZip()

  for (const { blob, filename } of blobs) {
    zip.file(filename, blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, buildZipFilename())
}
