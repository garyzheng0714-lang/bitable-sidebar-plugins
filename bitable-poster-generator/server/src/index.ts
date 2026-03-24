import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {
  buildOAuthUrl,
  exchangeCodeForToken,
  getUserInfoByAccessToken,
  getUserInfoByOpenId,
} from './auth.js';
import { authMiddleware } from './middleware.js';
import {
  initDatabase,
  upsertUser,
  upsertSession,
  deleteSession,
  listAppData,
  listTeamAppData,
  getAppData,
  putAppData,
  deleteAppData,
  getUserByOpenId,
} from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = Number(process.env.PORT || 4567);
const appId = process.env.FEISHU_APP_ID || '';
const appSecret = process.env.FEISHU_APP_SECRET || '';
const oauthRedirectUri = process.env.FEISHU_OAUTH_REDIRECT_URI || '';
const frontendOrigin = process.env.FRONTEND_ORIGIN || '*';

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: frontendOrigin === '*' ? true : frontendOrigin.split(','),
  credentials: true,
}));

initDatabase();

// ── Auth: Plugin login (Bitable sidebar) ──

app.post('/api/auth/plugin-login', async (req, res) => {
  const { open_id } = req.body;
  if (!open_id || typeof open_id !== 'string') {
    res.status(400).json({ error: 'open_id required' });
    return;
  }

  const userInfo = await getUserInfoByOpenId(appId, appSecret, open_id);
  if (!userInfo) {
    res.status(403).json({ error: 'user_not_found_in_tenant' });
    return;
  }

  const user = await upsertUser({
    openId: userInfo.open_id,
    unionId: userInfo.union_id,
    name: userInfo.name,
    avatarUrl: userInfo.avatar_url,
    email: userInfo.email,
  });

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  await upsertSession({
    token,
    openId: user.open_id,
    accessToken: 'plugin-mode',
    expiresAt,
  });

  res.json({
    token,
    user: { open_id: user.open_id, name: user.name, avatar_url: user.avatar_url },
  });
});

// ── Auth: OAuth login (web apps) ──

app.get('/api/auth/login', (req, res) => {
  const returnUrl = (req.query.return_url as string) || '/';
  const state = Buffer.from(JSON.stringify({ returnUrl })).toString('base64url');
  const url = buildOAuthUrl(appId, oauthRedirectUri, state);
  res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send('missing code');
    return;
  }

  let returnUrl = '/';
  try {
    const stateStr = Buffer.from((req.query.state as string) || '', 'base64url').toString();
    returnUrl = JSON.parse(stateStr).returnUrl || '/';
  } catch { /* ignore */ }

  const tokenData = await exchangeCodeForToken(appId, appSecret, code);
  const userInfo = await getUserInfoByAccessToken(tokenData.access_token);

  const user = await upsertUser({
    openId: userInfo.open_id,
    unionId: userInfo.union_id,
    tenantKey: tokenData.tenant_key,
    name: userInfo.name,
    avatarUrl: userInfo.avatar_url,
    email: userInfo.email,
  });

  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  const refreshExpiresAt = new Date(Date.now() + tokenData.refresh_expires_in * 1000).toISOString();
  await upsertSession({
    token: sessionToken,
    openId: user.open_id,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    refreshExpiresAt,
  });

  const separator = returnUrl.includes('?') ? '&' : '?';
  res.redirect(`${returnUrl}${separator}session_token=${sessionToken}`);
});

// ── Auth: Current user ──

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  await deleteSession(req.sessionToken!);
  res.json({ ok: true });
});

// ── App Data CRUD ──

app.get('/api/data/:projectId', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const prefix = req.query.prefix as string | undefined;
  const items = await listAppData(projectId, req.user!.open_id, prefix);
  res.json({ items });
});

app.get('/api/data/:projectId/team', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const prefix = req.query.prefix as string | undefined;
  const user = await getUserByOpenId(req.user!.open_id);
  if (!user?.tenant_key) {
    res.json({ items: [] });
    return;
  }
  const items = await listTeamAppData(projectId, user.tenant_key, prefix);
  res.json({ items });
});

app.get('/api/data/:projectId/:dataKey', authMiddleware, async (req, res) => {
  const { projectId, dataKey } = req.params;
  const item = await getAppData(projectId, req.user!.open_id, dataKey);
  if (!item) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ item });
});

app.put('/api/data/:projectId/:dataKey', authMiddleware, async (req, res) => {
  const { projectId, dataKey } = req.params;
  const { value, visibility } = req.body;
  if (value === undefined) {
    res.status(400).json({ error: 'value required' });
    return;
  }
  const user = await getUserByOpenId(req.user!.open_id);
  const item = await putAppData({
    projectId,
    openId: req.user!.open_id,
    dataKey,
    dataValue: typeof value === 'string' ? value : JSON.stringify(value),
    visibility: visibility === 'team' ? 'team' : 'private',
    tenantKey: user?.tenant_key,
  });
  res.json({ item });
});

app.delete('/api/data/:projectId/:dataKey', authMiddleware, async (req, res) => {
  const { projectId, dataKey } = req.params;
  const ok = await deleteAppData(projectId, req.user!.open_id, dataKey);
  res.json({ ok });
});

// ── Health check ──

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve frontend static files (production) ──

const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
