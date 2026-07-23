/** 从 JWT 解析 payload（仅用于读取 sub 等公开字段） */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function parseTokenUserId(token: string): string {
  const payload = parseJwtPayload(token);
  const sub = payload?.sub;
  return sub != null ? String(sub) : "";
}
