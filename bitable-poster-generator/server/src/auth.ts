import axios from 'axios';

const FEISHU_BASE = 'https://open.feishu.cn/open-apis';

let tenantTokenCache: { token: string; expiresAt: number } | null = null;

export async function getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
  if (tenantTokenCache && Date.now() < tenantTokenCache.expiresAt) {
    return tenantTokenCache.token;
  }
  const res = await axios.post(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    app_id: appId,
    app_secret: appSecret,
  });
  const token = res.data.tenant_access_token as string;
  const expire = (res.data.expire as number) || 7200;
  tenantTokenCache = { token, expiresAt: Date.now() + (expire - 300) * 1000 };
  return token;
}

export interface FeishuUserInfo {
  open_id: string;
  union_id?: string;
  name: string;
  en_name?: string;
  avatar_url?: string;
  email?: string;
}

export async function getUserInfoByAccessToken(userAccessToken: string): Promise<FeishuUserInfo> {
  const res = await axios.get(`${FEISHU_BASE}/authen/v1/user_info`, {
    headers: { Authorization: `Bearer ${userAccessToken}` },
  });
  if (res.data.code !== 0) {
    throw new Error(`Feishu user_info error: ${res.data.msg}`);
  }
  return res.data.data as FeishuUserInfo;
}

export async function getUserInfoByOpenId(
  appId: string,
  appSecret: string,
  openId: string
): Promise<FeishuUserInfo | null> {
  try {
    const token = await getTenantAccessToken(appId, appSecret);
    const res = await axios.get(`${FEISHU_BASE}/contact/v3/users/${openId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { user_id_type: 'open_id' },
    });
    if (res.data.code !== 0) return null;
    const u = res.data.data?.user;
    if (!u) return null;
    return {
      open_id: u.open_id,
      union_id: u.union_id,
      name: u.name,
      en_name: u.en_name,
      avatar_url: u.avatar?.avatar_origin || u.avatar?.avatar_72,
      email: u.email,
    };
  } catch {
    return null;
  }
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  union_id?: string;
  tenant_key?: string;
}

export async function exchangeCodeForToken(
  appId: string,
  appSecret: string,
  code: string
): Promise<OAuthTokenResponse> {
  const res = await axios.post(`${FEISHU_BASE}/authen/v1/oidc/access_token`, {
    grant_type: 'authorization_code',
    code,
  }, {
    headers: {
      Authorization: `Bearer ${await getTenantAccessToken(appId, appSecret)}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.data.code !== 0) {
    throw new Error(`OAuth token exchange failed: ${res.data.msg}`);
  }
  return res.data.data as OAuthTokenResponse;
}

export function buildOAuthUrl(appId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });
  return `${FEISHU_BASE}/authen/v1/authorize?${params.toString()}`;
}
