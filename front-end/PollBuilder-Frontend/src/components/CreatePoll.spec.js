// src/components/CreatePoll.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreatePoll from './CreatePoll.vue'
import { pollApi } from '../api/pollApi'

vi.mock('../api/pollApi', () => ({
  pollApi: { create: vi.fn() },
}))

describe('CreatePoll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(CreatePoll, {
      global: { stubs: { RouterLink: true } },
    })
  }

  // Helper: tìm đúng nút "Tao poll" theo text thật (không dấu) trong component
  function getCreateButton(wrapper) {
    return wrapper.findAll('button').find((b) => b.text().includes('Tao poll'))
  }

  // Helper: tìm đúng nút "+ Them lua chon"
  function getAddOptionButton(wrapper) {
    return wrapper.findAll('button').find((b) => b.text().includes('Them lua chon'))
  }

  it('báo lỗi khi chưa nhập câu hỏi', async () => {
    const wrapper = mountComponent()

    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Vui lòng nhập câu hỏi')
  })

  it('báo lỗi khi thiếu lựa chọn hợp lệ', async () => {
    const wrapper = mountComponent()

    await wrapper.find('input').setValue('Bạn thích màu gì?')
    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Vui lòng nhập ít nhất 2 lựa chọn')
  })

  it('tạo poll thành công khi nhập đủ dữ liệu', async () => {
    pollApi.create.mockResolvedValue({ code: 'ABC123' })

    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Bạn thích màu gì?')
    await inputs[1].setValue('Đỏ')
    await inputs[2].setValue('Xanh')

    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(pollApi.create).toHaveBeenCalledWith('Bạn thích màu gì?', ['Đỏ', 'Xanh'])
    expect(wrapper.text()).toContain('Tao thanh cong!')
    expect(wrapper.text()).toContain('ABC123')
  })

  it('hiện lỗi khi API create thất bại', async () => {
    pollApi.create.mockRejectedValue(new Error('Loi server'))

    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Bạn thích màu gì?')
    await inputs[1].setValue('Đỏ')
    await inputs[2].setValue('Xanh')

    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Loi server')
  })

  it('thêm được lựa chọn mới, tối đa 6', async () => {
    const wrapper = mountComponent()

    // Bắt đầu với 2 input lựa chọn, bấm thêm 4 lần để đạt tối đa 6
    for (let i = 0; i < 4; i++) {
      await getAddOptionButton(wrapper).trigger('click')
    }

    // 1 input câu hỏi + 6 input lựa chọn = 7
    expect(wrapper.findAll('input').length).toBe(7)

    // Nút "+ Them lua chon" phải biến mất khi đã đủ 6 lựa chọn
    expect(getAddOptionButton(wrapper)).toBeUndefined()
  })

  it('xoá được lựa chọn khi có hơn 2 lựa chọn', async () => {
    const wrapper = mountComponent()

    // Thêm 1 lựa chọn để có 3 lựa chọn -> nút "X" xuất hiện
    await getAddOptionButton(wrapper).trigger('click')
    expect(wrapper.findAll('input').length).toBe(4) // 1 câu hỏi + 3 lựa chọn

    const removeBtn = wrapper.findAll('button').find((b) => b.text() === 'X')
    expect(removeBtn).toBeTruthy()

    await removeBtn.trigger('click')
    expect(wrapper.findAll('input').length).toBe(3) // 1 câu hỏi + 2 lựa chọn
  })

  it('không cho bấm nút Tao poll khi đang loading', async () => {
    // Mock create trả về promise "treo" để kiểm tra trạng thái loading
    let resolveFn
    pollApi.create.mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve
      })
    )

    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Bạn thích màu gì?')
    await inputs[1].setValue('Đỏ')
    await inputs[2].setValue('Xanh')

    const createBtn = getCreateButton(wrapper)
    await createBtn.trigger('click')

    expect(wrapper.text()).toContain('Dang tao...')
    expect(createBtn.attributes('disabled')).not.toBeUndefined()

    resolveFn({ code: 'XYZ999' })
    await new Promise((r) => setTimeout(r, 0))
  })
})