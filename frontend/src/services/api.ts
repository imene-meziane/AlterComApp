const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

type StoredSession = { accessToken: string; refreshToken: string } | null;

function readStoredSession(): StoredSession {
  try {
    const raw = window.localStorage.getItem('altercom.auth.v4');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.accessToken === 'string') return parsed;
    // Fallback: raw token string
    if (typeof raw === 'string' && raw.trim()) {
      return { accessToken: raw, refreshToken: '' };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function persistSession(accessToken: string, refreshToken: string): void {
  try {
    window.localStorage.setItem('altercom.auth.v4', JSON.stringify({ accessToken, refreshToken }));
  } catch (e) {
    // ignore
  }
}

async function tryRefreshToken(refreshToken: string): Promise<StoredSession> {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[api] trying refresh token...');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[api] refresh failed with status', res.status);
      }
      return null;
    }

    const body = await res.json();
    if (body && body.accessToken) {
      persistSession(body.accessToken, body.refreshToken || '');
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[api] refresh successful, new access token saved');
      }
      return { accessToken: body.accessToken, refreshToken: body.refreshToken || '' };
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[api] refresh exception', e);
    }
  }

  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
  retrying = false
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const hadAuth = Boolean(token);

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[api] request', { path, hadAuth, method: options.method || 'GET' });
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[api] response', { path, status: response.status });
  }

  const rawBody = await response.text();

  // Parser JSON de façon robuste (message d'erreur backend peut ne pas retourner de JSON)
  let data: any = null;
  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (e) {
    data = null;
  }

  // Gestion 401 : si la requête était authentifiée, tenter un refresh de token une seule fois
  if (response.status === 401 && hadAuth) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[api] 401 received for', path, 'hadAuth=', hadAuth, 'retrying=', retrying);
    }

    if (retrying) {
      // déjà essayé de rafraîchir -> considérer la session comme invalide
      try {
        window.localStorage.removeItem('altercom.auth.v4');
      } catch (e) {
        // ignore
      }
      try {
        window.dispatchEvent(new CustomEvent('altercom:unauth'));
      } catch (e) {
        // ignore
      }
      return Promise.reject(new Error(data?.message || 'Authentification requise.'));
    }

    const stored = readStoredSession();

    if (stored && stored.refreshToken) {
      const refreshed = await tryRefreshToken(stored.refreshToken);
      if (refreshed && refreshed.accessToken) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[api] retrying original request with refreshed token for', path);
        }
        // Réessayer la requête originale avec le nouveau token
        return request<T>(path, options, refreshed.accessToken, true);
      }
    }

    // Pas de refresh possible ou échec -> déclencher la déconnexion
    try {
      window.localStorage.removeItem('altercom.auth.v4');
    } catch (e) {
      // ignore
    }
    try {
      window.dispatchEvent(new CustomEvent('altercom:unauth'));
    } catch (e) {
      // ignore
    }

    return Promise.reject(new Error(data?.message || 'Authentification requise.'));
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Une erreur est survenue.');
  }

  return data as T;
}

export const api = {
  get<T = unknown>(path: string, token?: string): Promise<T> {
    return request<T>(path, { method: 'GET' }, token);
  },
  post<T = unknown>(path: string, body: unknown, token?: string): Promise<T> {
    return request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      token
    );
  },
  put<T = unknown>(path: string, body: unknown, token?: string): Promise<T> {
    return request<T>(
      path,
      {
        method: 'PUT',
        body: JSON.stringify(body)
      },
      token
    );
  },
  delete<T = unknown>(path: string, token?: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' }, token);
  }
};
