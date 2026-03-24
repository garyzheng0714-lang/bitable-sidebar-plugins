import pg from 'pg';

export interface UserRow {
  open_id: string;
  union_id: string | null;
  tenant_key: string | null;
  name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  token: string;
  open_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  refresh_expires_at: string;
  created_at: string;
}

export interface AppDataRow {
  id: number;
  project_id: string;
  open_id: string;
  data_key: string;
  data_value: string;
  visibility: string;
  tenant_key: string | null;
  created_at: string;
  updated_at: string;
}

let pool: pg.Pool | null = null;

export function initDatabase(): pg.Pool {
  if (pool) return pool;
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  return pool;
}

// ── Users ──

export async function upsertUser(user: {
  openId: string;
  unionId?: string | null;
  tenantKey?: string | null;
  name: string;
  avatarUrl?: string | null;
  email?: string | null;
}): Promise<UserRow> {
  const db = initDatabase();
  const { rows } = await db.query(
    `INSERT INTO users (open_id, union_id, tenant_key, name, avatar_url, email, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT(open_id) DO UPDATE SET
       union_id   = EXCLUDED.union_id,
       tenant_key = COALESCE(EXCLUDED.tenant_key, users.tenant_key),
       name       = EXCLUDED.name,
       avatar_url = EXCLUDED.avatar_url,
       email      = EXCLUDED.email,
       updated_at = NOW()
     RETURNING *`,
    [user.openId, user.unionId ?? null, user.tenantKey ?? null, user.name, user.avatarUrl ?? null, user.email ?? null]
  );
  return rows[0] as UserRow;
}

export async function getUserByOpenId(openId: string): Promise<UserRow | undefined> {
  const db = initDatabase();
  const { rows } = await db.query('SELECT * FROM users WHERE open_id = $1', [openId]);
  return rows[0] as UserRow | undefined;
}

// ── Sessions ──

export async function upsertSession(session: {
  token: string;
  openId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  refreshExpiresAt?: string;
}): Promise<SessionRow> {
  const db = initDatabase();
  const { rows } = await db.query(
    `INSERT INTO sessions (token, open_id, access_token, refresh_token, expires_at, refresh_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT(token) DO UPDATE SET
       access_token       = EXCLUDED.access_token,
       refresh_token      = EXCLUDED.refresh_token,
       expires_at         = EXCLUDED.expires_at,
       refresh_expires_at = EXCLUDED.refresh_expires_at
     RETURNING *`,
    [
      session.token,
      session.openId,
      session.accessToken,
      session.refreshToken ?? '',
      session.expiresAt,
      session.refreshExpiresAt ?? new Date().toISOString(),
    ]
  );
  return rows[0] as SessionRow;
}

export async function getSessionByToken(token: string): Promise<SessionRow | undefined> {
  const db = initDatabase();
  const { rows } = await db.query('SELECT * FROM sessions WHERE token = $1', [token]);
  return rows[0] as SessionRow | undefined;
}

export async function deleteSession(token: string): Promise<void> {
  const db = initDatabase();
  await db.query('DELETE FROM sessions WHERE token = $1', [token]);
}

// ── App Data (multi-project) ──

export async function listAppData(projectId: string, openId: string, keyPrefix?: string): Promise<AppDataRow[]> {
  const db = initDatabase();
  if (keyPrefix) {
    const { rows } = await db.query(
      'SELECT * FROM app_data WHERE project_id = $1 AND open_id = $2 AND data_key LIKE $3 ORDER BY updated_at DESC',
      [projectId, openId, keyPrefix + '%']
    );
    return rows as AppDataRow[];
  }
  const { rows } = await db.query(
    'SELECT * FROM app_data WHERE project_id = $1 AND open_id = $2 ORDER BY updated_at DESC',
    [projectId, openId]
  );
  return rows as AppDataRow[];
}

export async function listTeamAppData(projectId: string, tenantKey: string, keyPrefix?: string): Promise<AppDataRow[]> {
  const db = initDatabase();
  if (keyPrefix) {
    const { rows } = await db.query(
      `SELECT * FROM app_data WHERE project_id = $1 AND tenant_key = $2 AND visibility = 'team' AND data_key LIKE $3 ORDER BY updated_at DESC`,
      [projectId, tenantKey, keyPrefix + '%']
    );
    return rows as AppDataRow[];
  }
  const { rows } = await db.query(
    `SELECT * FROM app_data WHERE project_id = $1 AND tenant_key = $2 AND visibility = 'team' ORDER BY updated_at DESC`,
    [projectId, tenantKey]
  );
  return rows as AppDataRow[];
}

export async function getAppData(projectId: string, openId: string, dataKey: string): Promise<AppDataRow | undefined> {
  const db = initDatabase();
  const { rows } = await db.query(
    'SELECT * FROM app_data WHERE project_id = $1 AND open_id = $2 AND data_key = $3',
    [projectId, openId, dataKey]
  );
  return rows[0] as AppDataRow | undefined;
}

export async function putAppData(item: {
  projectId: string;
  openId: string;
  dataKey: string;
  dataValue: string;
  visibility?: string;
  tenantKey?: string | null;
}): Promise<AppDataRow> {
  const db = initDatabase();
  const { rows } = await db.query(
    `INSERT INTO app_data (project_id, open_id, data_key, data_value, visibility, tenant_key, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT(project_id, open_id, data_key) DO UPDATE SET
       data_value = EXCLUDED.data_value,
       visibility = EXCLUDED.visibility,
       tenant_key = EXCLUDED.tenant_key,
       updated_at = NOW()
     RETURNING *`,
    [item.projectId, item.openId, item.dataKey, item.dataValue, item.visibility ?? 'private', item.tenantKey ?? null]
  );
  return rows[0] as AppDataRow;
}

export async function deleteAppData(projectId: string, openId: string, dataKey: string): Promise<boolean> {
  const db = initDatabase();
  const result = await db.query(
    'DELETE FROM app_data WHERE project_id = $1 AND open_id = $2 AND data_key = $3',
    [projectId, openId, dataKey]
  );
  return (result.rowCount ?? 0) > 0;
}
