import { createRouter, createWebHistory } from 'vue-router'
import CreatePoll from '../components/CreatePoll.vue'
import VotePoll from '../components/VotePoll.vue'
import ResultsPoll from '../components/ResultsPoll.vue'

const routes = [
  { path: '/', name: 'Create', component: CreatePoll },
  { path: '/poll/:code', name: 'Vote', component: VotePoll },
  { path: '/poll/:code/results', name: 'Results', component: ResultsPoll },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})