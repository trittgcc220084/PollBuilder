// Tự động lấy URL API từ biến môi trường Vercel/Vite, fallback về Gateway/PollService
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'

// Chuẩn hóa đường dẫn: Loại bỏ dấu '/' ở cuối và gắn thêm prefix '/api'
const API_BASE = `${rawBaseUrl.replace(/\/$/, '')}/api`

/**
 * Hàm wrapper chung cho tất cả các HTTP Request
 */
async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, config)

    // Xử lý khi Response báo lỗi HTTP (4xx, 5xx)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || `HTTP ${res.status}`)
    }

    // Xử lý trường hợp thành công nhưng không có nội dung trả về (HTTP 204)
    if (res.status === 204) {
      return null
    }

    return await res.json()
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message)
    throw error
  }
}

/**
 * Object chứa các hàm gọi API cho chức năng Polls
 */
export const pollApi = {
  // Tạo bài bình chọn mới
  create(question, options) {
    return request('/polls', {
      method: 'POST',
      body: JSON.stringify({ question, options }),
    })
  },

  // Lấy chi tiết bài bình chọn theo Code
  get(code) {
    return request(`/polls/${code}`)
  },

  // Lấy kết quả bài bình chọn
  results(code) {
    return request(`/polls/${code}/results`)
  },

  // Thực hiện bình chọn cho 1 đáp án (optionIndex)
  vote(code, optionIndex) {
    return request(`/polls/${code}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    })
  },

  // Đóng/Khóa bài bình chọn
  close(code) {
    return request(`/polls/${code}/close`, {
      method: 'PATCH',
    })
  },
}

export default pollApi