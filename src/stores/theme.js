import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  function applyTheme(t) {
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', t === 'dark' ? '#1a1f2e' : '#F5A151')
    }
  }

  function setTheme(t) {
    theme.value = t
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // Initialize
  applyTheme(theme.value)

  return { theme, setTheme, toggleTheme }
})
