<template>
  <div>
    <div v-if="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="results">
      <h2>{{ results.question }}</h2>
      <p>
        Tổng vote: <strong>{{ results.totalVotes }}</strong>
        · Trạng thái: <strong>{{ results.status }}</strong>
      </p>

      <PollChart :options="results.options" :counts="results.counts" />

      <div style="margin-top:1.5rem; display:flex; gap:1rem">
        <router-link :to="`/poll/${code}`" class="btn">Đi vote</router-link>
        <button v-if="results.status === 'open'" @click="closePoll" style="background:#ef4444">
          Đóng poll
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import * as signalR from '@microsoft/signalr'
import { pollApi } from '../api/pollApi'
import PollChart from './PollChart.vue'

const route = useRoute()
const code = route.params.code

const results = ref(null)
const loading = ref(true)
const error = ref('')
let connection = null

// Tự động lấy URL Render khi đưa lên Vercel, nếu chạy local sẽ dùng localhost:5005
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'
const hubUrl = `${baseUrl.replace(/\/$/, '')}/hubs/polls`

onMounted(async () => {
  try {
    results.value = await pollApi.results(code)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }

  // Khởi tạo kết nối SignalR sử dụng đường dẫn Hub động
  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build()

  connection.on('VoteReceived', (newResults) => {
    results.value = newResults
  })

  connection.on('PollClosed', () => {
    if (results.value) results.value.status = 'closed'
  })

  try {
    await connection.start()
    await connection.invoke('JoinPoll', code)
  } catch (e) {
    console.error('SignalR error', e)
  }
})

onUnmounted(() => {
  if (connection) connection.stop()
})

async function closePoll() {
  try {
    await pollApi.close(code)
    results.value.status = 'closed'
  } catch (e) {
    alert(e.message)
  }
}
</script>