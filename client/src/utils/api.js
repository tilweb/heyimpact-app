const API_BASE = '';

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('bw_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Fehler ${res.status}`);
  }
  return res.json();
}
