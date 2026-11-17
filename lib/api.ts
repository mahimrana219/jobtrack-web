import { demo, DEMO_USER, resetDemo } from './demo';
import type { Application, ApplicationInput, ListQuery, ListResult, Stats, User } from './types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
export const apiConfigured = API_URL.length > 0;

const TOKEN_KEY = 'jobtrack.token';
const MODE_KEY = 'jobtrack.mode';

type Mode = 'api' | 'demo';

function store(key: string, value?: string) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage blocked: session lasts until reload */
  }
}

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getMode(): Mode | null {
  return (load(MODE_KEY) as Mode | null) ?? null;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: string[] = []) {
    super(message);
  }
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = load(TOKEN_KEY);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(`Can't reach the API at ${API_URL}. Check that the server is running.`, 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fields: string[] = Array.isArray(body.errors) ? body.errors.map((e: { message?: string; field?: string }) => (e.field ? `${e.field}: ${e.message}` : e.message ?? '')) : [];
    if (res.status === 401 && path !== '/api/auth/login') signOut();
    throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status, fields);
  }
  return body as T;
}

function qs(q: ListQuery) {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

// Strip empty strings so the API's validators don't reject optional fields
function clean<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== '' && v !== undefined)) as T;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user, token } = await http<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  store(TOKEN_KEY, token);
  store(MODE_KEY, 'api');
  return user;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const { user, token } = await http<{ user: User; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  store(TOKEN_KEY, token);
  store(MODE_KEY, 'api');
  return user;
}

export function startDemo() {
  resetDemo();
  store(MODE_KEY, 'demo');
}

export function signOut() {
  store(TOKEN_KEY);
  store(MODE_KEY);
}

export async function currentUser(): Promise<User | null> {
  const mode = getMode();
  if (mode === 'demo') return DEMO_USER;
  if (mode === 'api' && load(TOKEN_KEY)) {
    try {
      const { user } = await http<{ user: User }>('/api/auth/me');
      return user;
    } catch {
      return null;
    }
  }
  return null;
}

export const applications = {
  list(q: ListQuery = {}): Promise<ListResult> {
    return getMode() === 'demo' ? demo.list(q) : http(`/api/applications${qs(q)}`);
  },
  create(input: ApplicationInput): Promise<Application> {
    return getMode() === 'demo' ? demo.create(input) : http('/api/applications', { method: 'POST', body: JSON.stringify(clean(input)) });
  },
  update(id: string, patch: Partial<ApplicationInput>): Promise<Application> {
    return getMode() === 'demo'
      ? demo.update(id, patch)
      : http(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify(clean(patch)) });
  },
  remove(id: string): Promise<void> {
    return getMode() === 'demo' ? demo.remove(id) : http(`/api/applications/${id}`, { method: 'DELETE' });
  },
  stats(): Promise<Stats> {
    return getMode() === 'demo' ? demo.stats() : http('/api/applications/stats');
  },
};
