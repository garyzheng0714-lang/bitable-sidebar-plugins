import type { TemplateConfig } from '../types'
import { getAuthToken, listTemplates, listTeamTemplates, saveTemplateToServer, deleteTemplateFromServer } from '../services/api'

const STORAGE_KEY = 'poster-generator-templates'

function isLoggedIn(): boolean {
  return !!getAuthToken()
}

// ── LocalStorage fallback ──

function loadLocal(): TemplateConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveLocal(template: TemplateConfig) {
  const templates = loadLocal()
  const idx = templates.findIndex((t) => t.id === template.id)
  if (idx >= 0) templates[idx] = template
  else templates.push(template)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

function deleteLocal(id: string) {
  const templates = loadLocal().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

// ── Public API (auto-switch local / server) ──

export async function loadAllTemplates(): Promise<TemplateConfig[]> {
  if (!isLoggedIn()) return loadLocal()
  try {
    const { items } = await listTemplates()
    return items.map((item) => {
      const config = JSON.parse(item.data_value) as TemplateConfig
      config.visibility = item.visibility as 'private' | 'team' | undefined
      return config
    })
  } catch {
    return loadLocal()
  }
}

export async function loadTeamTemplates(): Promise<TemplateConfig[]> {
  if (!isLoggedIn()) return []
  try {
    const { items } = await listTeamTemplates()
    return items.map((item) => {
      const config = JSON.parse(item.data_value) as TemplateConfig
      config.visibility = 'team'
      return config
    })
  } catch {
    return []
  }
}

export async function saveTemplate(
  template: TemplateConfig,
  visibility: 'private' | 'team' = 'private',
): Promise<void> {
  saveLocal(template)
  if (isLoggedIn()) {
    await saveTemplateToServer(template.id, JSON.stringify(template), visibility)
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  deleteLocal(id)
  if (isLoggedIn()) {
    await deleteTemplateFromServer(id)
  }
}

export function generateId(): string {
  return crypto.randomUUID()
}
