const API_BASE = '/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface AuthUser {
  open_id: string;
  name: string;
  avatar_url: string | null;
}

export async function pluginLogin(openId: string): Promise<{ token: string; user: AuthUser }> {
  return request('POST', '/auth/plugin-login', { open_id: openId });
}

export async function getMe(): Promise<{ user: AuthUser }> {
  return request('GET', '/auth/me');
}

export async function logout(): Promise<void> {
  await request('POST', '/auth/logout');
  setAuthToken(null);
}

// ── App Data (templates) ──

const PROJECT_ID = 'poster-generator';

export async function listTemplates(): Promise<{ items: Array<{ data_key: string; data_value: string; visibility?: string; updated_at: string }> }> {
  return request('GET', `/data/${PROJECT_ID}?prefix=template:`);
}

export async function listTeamTemplates(): Promise<{ items: Array<{ data_key: string; data_value: string; open_id?: string; updated_at: string }> }> {
  return request('GET', `/data/${PROJECT_ID}/team?prefix=template:`);
}

export async function getTemplate(id: string): Promise<{ item: { data_value: string } }> {
  return request('GET', `/data/${PROJECT_ID}/template:${id}`);
}

export async function saveTemplateToServer(id: string, value: string, visibility?: 'private' | 'team'): Promise<void> {
  await request('PUT', `/data/${PROJECT_ID}/template:${id}`, { value, visibility });
}

export async function deleteTemplateFromServer(id: string): Promise<void> {
  await request('DELETE', `/data/${PROJECT_ID}/template:${id}`);
}
