import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'
import { initEcho, disconnectEcho } from '@/services/echo'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const token = ref(localStorage.getItem('auth_token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const res = await authAPI.login(credentials)
      const { data } = res.data
      user.value = data.user
      token.value = data.token
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      initEcho()
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      const res = await authAPI.register(userData)
      const { data } = res.data
      user.value = data.user
      token.value = data.token
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      initEcho()
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      const errors = err.response?.data?.errors
      return { success: false, message: error.value, errors }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authAPI.logout()
    } catch (e) {}
    disconnectEcho()
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  async function fetchMe() {
    try {
      const res = await authAPI.me()
      user.value = res.data.data
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    } catch (e) {}
  }

  function updateUser(userData) {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('auth_user', JSON.stringify(user.value))
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    fetchMe,
    updateUser,
  }
})
