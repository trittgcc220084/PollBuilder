// src/components/VotePoll.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VotePoll from './VotePoll.vue'
import { pollApi } from '../api/pollApi'

vi.mock('../api/pollApi', () => ({
  pollApi: { get: vi.fn(), vote: vi.fn() },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { code: 'ABC123' } }),
}))

const mockPoll = {
  question: 'Bạn thích màu gì?',
  status: 'open',
  options: [
    { index: 0, text: 'Đỏ' },
    { index: 1, text: 'Xanh' },
  ],
}

describe('VotePoll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(VotePoll, {
      global: { stubs: { RouterLink: true } },
    })
  }

  it('hiển thị câu hỏi và lựa chọn sau khi tải xong', async () => {
    pollApi.get.mockResolvedValue(mockPoll)
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Bạn thích màu gì?')
    expect(wrapper.text()).toContain('Đỏ')
    expect(wrapper.text()).toContain('Xanh')
  })

  it('hiện lỗi khi không tải được poll', async () => {
    pollApi.get.mockRejectedValue(new Error('Không tìm thấy poll'))
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Không tìm thấy poll')
  })

  it('không cho vote khi poll đã đóng', async () => {
    pollApi.get.mockResolvedValue({ ...mockPoll, status: 'closed' })
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Poll đã đóng')
    expect(wrapper.find('input[type="radio"]').exists()).toBe(false)
  })

  it('nút Gửi vote bị disable khi chưa chọn lựa chọn nào', async () => {
    pollApi.get.mockResolvedValue(mockPoll)
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    const voteBtn = wrapper.find('button')
    expect(voteBtn.attributes('disabled')).not.toBeUndefined()
  })

  it('gửi vote thành công khi chọn 1 lựa chọn', async () => {
    pollApi.get.mockResolvedValue(mockPoll)
    pollApi.vote.mockResolvedValue({})

    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    const radios = wrapper.findAll('input[type="radio"]')
    await radios[0].setValue()
    await wrapper.find('button').trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(pollApi.vote).toHaveBeenCalledWith('ABC123', 0)
    expect(wrapper.text()).toContain('Bạn đã vote thành công')
  })

  it('hiện lỗi khi gửi vote thất bại', async () => {
    pollApi.get.mockResolvedValue(mockPoll)
    pollApi.vote.mockRejectedValue(new Error('Lỗi mạng, thử lại sau'))

    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    const radios = wrapper.findAll('input[type="radio"]')
    await radios[0].setValue()
    await wrapper.find('button').trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Lỗi mạng, thử lại sau')
  })
})