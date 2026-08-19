<template>
  <div>
    <div v-if="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="poll">
      <h2>{{ poll.question }}</h2>
      
      <!-- Chuyển status về chữ thường để so sánh chính xác -->
      <p v-if="poll.status?.toLowerCase() === 'closed'" class="error">
        Poll đã đóng, không thể vote.
      </p>

      <div v-else>
        <div v-for="opt in poll.options" :key="opt.index" style="margin: 0.75rem 0">
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer">
            <input type="radio" :value="opt.index" v-model="selected" />
            {{ opt.text }}
          </label>
        </div>

        <button :disabled="selected === null || voting" @click="submitVote">
          {{ voting ? 'Đang gửi...' : 'Gửi vote' }}
        </button>
      </div>

      <p v-if="voted" class="success">✅ Bạn đã vote thành công!</p>
      <p v-if="voteError" class="error">{{ voteError }}</p>

      <p style="margin-top:1.5rem">
        <router-link :to="`/poll/${code}/results`">Xem kết quả realtime →</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { pollApi } from '../api/pollApi'

const route = useRoute()
const code = route.params.code

const poll = ref(null)
const loading = ref(true)
const error = ref('')
const selected = ref(null)
const voting = ref(false)
const voted = ref(false)
const voteError = ref('')

onMounted(async () => {
  console.log('VOTE POLL MOUNTED')
  try {
    poll.value = await pollApi.get(code)
  } catch (e) {
    error.value = e.message || 'Không thể tải thông tin bình chọn'
  } finally {
    loading.value = false
  }
})

async function submitVote() {
  if (selected.value === null) return
  
  voting.value = true
  voteError.value = ''
  try {
    await pollApi.vote(code, selected.value)
    voted.value = true
  } catch (e) {
    voteError.value = e.message || 'Lỗi khi gửi bình chọn'
  } finally {
    voting.value = false
  }
}
</script>