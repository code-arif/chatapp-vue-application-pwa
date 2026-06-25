import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  deleteAccount: () => api.delete('/auth/account'),
}

// Profile API
export const profileAPI = {
  show: () => api.get('/profile'),
  update: (data) => api.post('/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (status) => api.post('/profile/status', { status }),
  removeAvatar: () => api.delete('/profile/avatar'),
  updatePushSubscription: (subscription) => api.post('/profile/push-subscription', { subscription }),
}

// Users API
export const usersAPI = {
  index: (params) => api.get('/users', { params }),
  search: (query, limit = 10) => api.get('/users/search', { params: { query, limit } }),
  online: () => api.get('/users/online'),
  heartbeat: () => api.post('/users/heartbeat'),
  show: (id) => api.get(`/users/${id}`),
}

// Conversations API
export const conversationsAPI = {
  index: () => api.get('/conversations'),
  store: (data) => api.post('/conversations', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  show: (id) => api.get(`/conversations/${id}`),
  update: (id, data) => api.post(`/conversations/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  destroy: (id) => api.delete(`/conversations/${id}`),
  addUser: (id, userId) => api.post(`/conversations/${id}/add-user`, { user_id: userId }),
  removeUser: (id, userId) => api.post(`/conversations/${id}/remove-user`, { user_id: userId }),
  makeAdmin: (id, userId) => api.post(`/conversations/${id}/make-admin`, { user_id: userId }),
  toggleMute: (id) => api.post(`/conversations/${id}/toggle-mute`),
  toggleArchive: (id) => api.post(`/conversations/${id}/toggle-archive`),
}

// Messages API
export const messagesAPI = {
  index: (conversationId, params) => api.get(`/conversations/${conversationId}/messages`, { params }),
  store: (data) => api.post('/messages', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  show: (id) => api.get(`/messages/${id}`),
  update: (id, content) => api.put(`/messages/${id}`, { content }),
  destroy: (id) => api.delete(`/messages/${id}`),
  markAsRead: (messageIds) => api.post('/messages/mark-as-read', { message_ids: messageIds }),
  unreadCount: () => api.get('/messages/unread-count'),
  toggleReaction: (id, emoji) => api.post(`/messages/${id}/reaction`, { emoji }),
}

// Typing API
export const typingAPI = {
  typing: (conversationId) => api.post(`/conversations/${conversationId}/typing`),
  stopTyping: (conversationId) => api.post(`/conversations/${conversationId}/stop-typing`),
  getCurrentlyTyping: (conversationId) => api.get(`/conversations/${conversationId}/typing-users`),
}

export default api
