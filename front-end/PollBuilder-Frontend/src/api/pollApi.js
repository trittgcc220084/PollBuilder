// Tự động lấy URL từ Vercel Env, nếu không có sẽ tự chạy về Localhost
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'
const API_BASE = `${rawBaseUrl.replace(/\/$/, '')}/api`

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const pollApi = {
  create(question, options) {
    return request('/polls', {
      method: 'POST',
      body: JSON.stringify({ question, options }),
    })
  },
  get(code) {
    return request(`/polls/${code}`)
  },
  results(code) {
    return request(`/polls/${code}/results`)
  },
  vote(code, optionIndex) {
    return request(`/polls/${code}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    })
  },
  close(code) {
    return request(`/polls/${code}/close`, {
      method: 'PATCH',
    })
  },
}