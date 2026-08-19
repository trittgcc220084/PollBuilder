<template>
  <div style="margin-top:1rem">
    <div
      v-for="opt in options"
      :key="opt.index"
      style="margin-bottom:10px"
    >
      <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px">
        <span>{{ opt.text }}</span>
        <span>{{ counts?.[opt.index] ?? 0 }} vote ({{ percent(opt.index) }}%)</span>
      </div>
      <div style="background:#334155; border-radius:6px; overflow:hidden; height:12px">
        <div
          :style="{
            width: percent(opt.index) + '%',
            background: '#3b82f6',
            height: '100%',
            transition: 'width 0.3s ease'
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: { type: Array, required: true },
  counts: { type: Object, default: () => ({}) },
})

function percent(index) {
  const values = Object.values(props.counts || {})
  const total = values.reduce((sum, v) => sum + v, 0)
  if (!total) return 0
  const count = props.counts?.[index] ?? 0
  return Math.round((count / total) * 100)
}
</script>