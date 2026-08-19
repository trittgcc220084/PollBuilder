const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'
const API_BASE = `${rawBaseUrl.replace(/\/$/, '')}/api`

async function request(url, options = {}) {
  const defaultHeaders = { 'Content-Type': 'application/json' }
  const config = {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) }
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, config)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || `HTTP ${res.status}`)
    }

    if (res.status === 204) return null
    return await res.json()
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message)
    throw error
  }
}

export const pollApi = {
  // PollService Endpoints
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
  close(code) {
    return request(`/polls/${code}/close`, { method: 'PATCH' })
  },

  // VoteService Endpoint (Tách riêng route /votes)
  vote(pollCode, optionIndex) {
    return request('/votes', {
      method: 'POST',
      body: JSON.stringify({ pollCode, optionIndex }),
    })
  },
}

export default pollApi