const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Une erreur est survenue.');
  }

  return data;
}

const api = {
  get(path, token) {
    return request(path, { method: 'GET' }, token);
  },
  post(path, body, token) {
    return request(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      token
    );
  },
  put(path, body, token) {
    return request(
      path,
      {
        method: 'PUT',
        body: JSON.stringify(body)
      },
      token
    );
  },
  delete(path, token) {
    return request(path, { method: 'DELETE' }, token);
  }
};

export default api;
