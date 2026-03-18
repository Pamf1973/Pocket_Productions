// Always use relative paths — Vercel proxies /api/* to Railway in production,
// Vite proxies /api/* to localhost:4000 in development.
const BASE = '';

export async function apiPost<T>(token: string, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return res.json();
}

export async function apiGet<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function apiPostFile<T>(token: string, path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return res.json();
}
