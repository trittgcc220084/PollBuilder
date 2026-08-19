// src/components/PollChart.spec.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PollChart from './PollChart.vue'

describe('PollChart', () => {
  const options = [
    { index: 0, text: 'Đỏ' },
    { index: 1, text: 'Xanh' },
  ]

  it('render đủ các lựa chọn', () => {
    const wrapper = mount(PollChart, {
      props: { options, counts: { 0: 3, 1: 1 } },
    })
    expect(wrapper.text()).toContain('Đỏ')
    expect(wrapper.text()).toContain('Xanh')
  })

  it('tính đúng phần trăm vote', () => {
    const wrapper = mount(PollChart, {
      props: { options, counts: { 0: 3, 1: 1 } },
    })
    // Đỏ: 3/4 = 75%, Xanh: 1/4 = 25%
    expect(wrapper.text()).toContain('75%')
    expect(wrapper.text()).toContain('25%')
  })

  it('hiển thị đúng số vote của từng lựa chọn', () => {
    const wrapper = mount(PollChart, {
      props: { options, counts: { 0: 3, 1: 1 } },
    })
    expect(wrapper.text()).toContain('3 vote')
    expect(wrapper.text()).toContain('1 vote')
  })

  it('không lỗi khi chưa có vote nào (total = 0)', () => {
    const wrapper = mount(PollChart, {
      props: { options, counts: {} },
    })
    expect(wrapper.text()).toContain('0%')
    expect(wrapper.text()).not.toContain('NaN')
  })

  it('không lỗi khi counts không có key tương ứng với option', () => {
    const wrapper = mount(PollChart, {
      props: { options, counts: { 0: 5 } }, // thiếu key "1"
    })
    expect(wrapper.text()).toContain('0 vote') // option 1 phải mặc định 0
  })
})