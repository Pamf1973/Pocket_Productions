const AUTH_KEY = 'pp_session';

export interface Session {
  email: string;
  name: string;
  role: string;
  signedInAt: number;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function isSignedIn(): boolean {
  return getSession() !== null;
}

export function signIn(email: string, _password: string): void {
  // Derive a display name from the email for demo purposes
  const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
  const name = namePart.replace(/\b\w/g, (c) => c.toUpperCase());
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ email, name, role: 'Executive Producer', signedInAt: Date.now() } satisfies Session),
  );
}

export function signUp(name: string, email: string, _password: string): void {
  const trimmedName = name.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ email, name: trimmedName, role: 'Executive Producer', signedInAt: Date.now() } satisfies Session),
  );
}

export function signOut(): void {
  localStorage.removeItem(AUTH_KEY);
}
