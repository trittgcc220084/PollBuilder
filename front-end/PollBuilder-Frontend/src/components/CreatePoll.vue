<template>
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; background: #1e293b; border-radius: 12px; color: #e2e8f0; font-family: sans-serif;">
    <h1 style="margin-bottom: 20px;">Poll Builder</h1>

    <label style="display:block; margin-bottom: 6px;">Cau hoi</label>
    <input v-model="question" placeholder="Ban thich mau nao?" 
      style="width:100%; padding:10px; margin-bottom:16px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:white;" />

    <label style="display:block; margin-bottom: 6px;">Lua chon (2-6)</label>
    <div v-for="(opt, i) in options" :key="i" style="display:flex; gap:8px; margin-bottom:8px;">
      <input v-model="options[i]" :placeholder="'Lua chon ' + (i+1)"
        style="flex:1; padding:10px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:white;" />
      <button v-if="options.length > 2" @click="options.splice(i,1)" 
        style="background:#ef4444; color:white; border:none; border-radius:8px; padding:0 12px; cursor:pointer;">X</button>
    </div>

    <button v-if="options.length < 6" @click="options.push('')" 
      style="background:#64748b; color:white; border:none; padding:8px 16px; border-radius:8px; margin-bottom:16px; cursor:pointer;">
      + Them lua chon
    </button>

    <br/>
    <button @click="createPoll" :disabled="loading"
      style="background:#3b82f6; color:white; border:none; padding:12px 24px; border-radius:8px; font-size:16px; cursor:pointer;">
      {{ loading ? 'Dang tao...' : 'Tao poll' }}
    </button>

    <p v-if="error" style="color:#f87171; margin-top:12px;">{{ error }}</p>

    <div v-if="created" style="margin-top:24px; padding:16px; background:#0f172a; border-radius:8px;">
      <p style="color:#4ade80;">Tao thanh cong!</p>
      <p>Ma poll: <strong>{{ created.code }}</strong></p>
      <p>
        Link vote:
        <router-link :to="'/poll/' + created.code" style="color:#38bdf8;">
          {{ origin }}/poll/{{ created.code }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { pollApi } from '../api/pollApi' // Thay đổi đường dẫn này nếu file pollApi.js nằm ở thư mục khác

const question = ref('')
const options = ref(['', ''])
const loading = ref(false)
const error = ref('')
const created = ref(null)
const origin = window.location.origin

async function createPoll() {
  error.value = ''
  created.value = null
  loading.value = true

  try {
    const cleanOptions = options.value.map(o => o.trim()).filter(Boolean)

    if (!question.value.trim()) {
      throw new Error('Vui lòng nhập câu hỏi')
    }
    if (cleanOptions.length < 2) {
      throw new Error('Vui lòng nhập ít nhất 2 lựa chọn')
    }

    // Gọi API qua ApiGateway (Port 5005)
    created.value = await pollApi.create(question.value.trim(), cleanOptions)
  } catch (e) {
    error.value = e.message || 'Loi tao poll'
  } finally {
    loading.value = false
  }
}
</script>