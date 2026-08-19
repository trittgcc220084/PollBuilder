// src/components/ResultsPoll.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsPoll from './ResultsPoll.vue'
import { pollApi } from '../api/pollApi'

vi.mock('../api/pollApi', () => ({
  pollApi: { results: vi.fn(), close: vi.fn() },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { code: 'ABC123' } }),
}))

// Dùng vi.hoisted để mock được tạo trước khi vi.mock() chạy (tránh lỗi thứ tự khởi tạo)
const { mockConnection, MockHubConnectionBuilder } = vi.hoisted(() => {
  const mockConnection = {
    on: vi.fn(),
    start: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
  }

  function MockHubConnectionBuilder() {
    this.withUrl = vi.fn().mockReturnThis()
    this.withAutomaticReconnect = vi.fn().mockReturnThis()
    this.build = vi.fn().mockReturnValue(mockConnection)
  }

  return { mockConnection, MockHubConnectionBuilder }
})

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: MockHubConnectionBuilder,
}))

const mockResults = {
  question: 'Bạn thích màu gì?',
  totalVotes: 4,
  status: 'open',
  options: [
    { index: 0, text: 'Đỏ' },
    { index: 1, text: 'Xanh' },
  ],
  counts: { 0: 3, 1: 1 },
}

describe('ResultsPoll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(ResultsPoll, {
      global: { stubs: { RouterLink: true } },
    })
  }

  it('hiển thị kết quả sau khi tải xong', async () => {
    pollApi.results.mockResolvedValue(mockResults)
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Bạn thích màu gì?')
    expect(wrapper.text()).toContain('Tổng vote')
    expect(wrapper.text()).toContain('4')
  })

  it('kết nối SignalR và lắng nghe sự kiện VoteReceived / PollClosed', async () => {
    pollApi.results.mockResolvedValue(mockResults)
    mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    expect(mockConnection.start).toHaveBeenCalled()
    expect(mockConnection.invoke).toHaveBeenCalledWith('JoinPoll', 'ABC123')
    expect(mockConnection.on).toHaveBeenCalledWith('VoteReceived', expect.any(Function))
    expect(mockConnection.on).toHaveBeenCalledWith('PollClosed', expect.any(Function))
  })

  it('đóng poll khi bấm nút Đóng poll', async () => {
    pollApi.results.mockResolvedValue(mockResults)
    pollApi.close.mockResolvedValue({})

    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    const closeBtn = wrapper.findAll('button').find((b) => b.text().includes('Đóng poll'))
    expect(closeBtn).toBeTruthy()

    await closeBtn.trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(pollApi.close).toHaveBeenCalledWith('ABC123')
    expect(wrapper.vm.results.status).toBe('closed')
  })

  it('không hiện nút Đóng poll khi poll đã đóng', async () => {
    pollApi.results.mockResolvedValue({ ...mockResults, status: 'closed' })
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    const closeBtn = wrapper.findAll('button').find((b) => b.text().includes('Đóng poll'))
    expect(closeBtn).toBeFalsy()
  })

  it('hiện lỗi khi API results thất bại', async () => {
    pollApi.results.mockRejectedValue(new Error('Không tìm thấy poll'))
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Không tìm thấy poll')
  })

  it('ngắt kết nối SignalR khi component bị unmount', async () => {
    pollApi.results.mockResolvedValue(mockResults)
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 0))

    wrapper.unmount()
    expect(mockConnection.stop).toHaveBeenCalled()
  })
})