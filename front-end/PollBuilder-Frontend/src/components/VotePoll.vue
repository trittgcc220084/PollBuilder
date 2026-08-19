<template>
  <div class="vote-container">
    <!-- State: Loading -->
    <div v-if="loading" class="card loading-state">
      <div class="spinner"></div>
      <p>Đang tải bài bình chọn...</p>
    </div>

    <!-- State: Error -->
    <div v-else-if="error" class="card error-state">
      <div class="icon">⚠️</div>
      <h3>Không thể tải dữ liệu</h3>
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="fetchPoll">Thử lại</button>
    </div>

    <!-- State: Content -->
    <div v-else-if="poll" class="card poll-card">
      <div class="poll-header">
        <span class="badge" :class="isClosed ? 'badge-closed' : 'badge-active'">
          {{ isClosed ? 'Đã đóng' : 'Đang diễn ra' }}
        </span>
        <h2 class="question">{{ poll.question }}</h2>
      </div>

      <!-- Closed Notice -->
      <div v-if="isClosed" class="alert alert-warning">
        🔒 Bài bình chọn này đã bị khóa. Bạn chỉ có thể xem kết quả.
      </div>

      <!-- Voting Options -->
      <div v-else class="options-list">
        <label
          v-for="opt in poll.options"
          :key="opt.index"
          class="option-item"
          :class="{ selected: selected === opt.index }"
        >
          <input
            type="radio"
            name="poll-option"
            :value="opt.index"
            v-model="selected"
            :disabled="voting || voted"
          />
          <span class="custom-radio"></span>
          <span class="option-text">{{ opt.text }}</span>
        </label>

        <button
          class="btn btn-primary btn-submit"
          :disabled="selected === null || voting || voted"
          @click="submitVote"
        >
          <span v-if="voting" class="spinner-sm"></span>
          <span>{{ voting ? 'Đang gửi bình chọn...' : 'Gửi lượt chọn' }}</span>
        </button>
      </div>

      <!-- Alerts -->
      <div v-if="voted" class="alert alert-success">
        🎉 Bạn đã thực hiện bình chọn thành công!
      </div>
      <div v-if="voteError" class="alert alert-danger">
        ❌ {{ voteError }}
      </div>

      <!-- Footer Link -->
      <div class="poll-footer">
        <router-link :to="`/poll/${code}/results`" class="results-link">
          📊 Xem kết quả trực tuyến (Realtime) &rarr;
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const isClosed = computed(() => poll.value?.status?.toLowerCase() === 'closed')

async function fetchPoll() {
  loading.value = true
  error.value = ''
  try {
    poll.value = await pollApi.get(code)
  } catch (e) {
    error.value = e.message || 'Không thể lấy thông tin bài bình chọn'
  } finally {
    loading.value = false
  }
}

async function submitVote() {
  if (selected.value === null || isClosed.value) return

  voting.value = true
  voteError.value = ''
  try {
    await pollApi.vote(code, selected.value)
    voted.value = true
  } catch (e) {
    voteError.value = e.message || 'Lỗi gửi bình chọn, vui lòng thử lại'
  } finally {
    voting.value = false
  }
}

onMounted(fetchPoll)
</script>

<style scoped>
.vote-container {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.card {
  background: #1e293b;
  color: #f8fafc;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid #334155;
}

.poll-header {
  margin-bottom: 1.5rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}
.badge-active { background: #059669; color: #ecfdf5; }
.badge-closed { background: #dc2626; color: #fef2f2; }

.question {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover { border-color: #3b82f6; }
.option-item.selected { border-color: #3b82f6; background: #1e1b4b; }

.option-item input { display: none; }

.custom-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #64748b;
  border-radius: 50%;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-item.selected .custom-radio {
  border-color: #3b82f6;
}
.option-item.selected .custom-radio::after {
  content: '';
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
}

.option-text { font-size: 1rem; font-weight: 500; }

.btn {
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  margin-top: 1rem;
}
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.alert {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  font-size: 0.9rem;
}
.alert-success { background: #064e3b; color: #a7f3d0; }
.alert-danger { background: #7f1d1d; color: #fecaca; }
.alert-warning { background: #78350f; color: #fde68a; }

.poll-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #334155;
  text-align: center;
}

.results-link {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
}
.results-link:hover { text-decoration: underline; }

.loading-state, .error-state { text-align: center; padding: 3rem 2rem; }
.spinner {
  width: 36px; height: 36px;
  border: 4px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>