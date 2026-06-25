import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

// Format message timestamp
export function formatMessageTime(dateStr) {
  const date = dayjs(dateStr)
  return date.format('h:mm A')
}

// Format last seen / conversation timestamp
export function formatLastSeen(dateStr) {
  if (!dateStr) return 'Never'
  const date = dayjs(dateStr)
  
  if (date.isToday()) {
    return date.format('h:mm A')
  } else if (date.isYesterday()) {
    return 'Yesterday'
  } else if (dayjs().diff(date, 'day') < 7) {
    return date.format('ddd')
  } else {
    return date.format('MM/DD/YY')
  }
}

// Format file size
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let i = 0
  while (size > 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${Math.round(size * 10) / 10} ${units[i]}`
}

// Get file icon based on mime type
export function getFileIcon(mimeType) {
  if (!mimeType) return '📎'
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️'
  return '📎'
}

// Truncate text
export function truncate(str, length = 40) {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

// Generate initials
export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

// Check if message is from today
export function isMessageFromToday(dateStr) {
  return dayjs(dateStr).isToday()
}

// Group messages by date
export function groupMessagesByDate(messages) {
  const groups = {}
  messages.forEach(msg => {
    const date = dayjs(msg.created_at)
    let key
    if (date.isToday()) {
      key = 'Today'
    } else if (date.isYesterday()) {
      key = 'Yesterday'
    } else if (dayjs().diff(date, 'day') < 7) {
      key = date.format('dddd')
    } else {
      key = date.format('MMMM D, YYYY')
    }
    
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
  })
  return groups
}

// Debounce
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Get message preview text
export function getMessagePreview(message) {
  if (!message) return 'No messages yet'
  
  switch (message.type) {
    case 'text': return message.content || ''
    case 'image': return '📷 Photo'
    case 'video': return '🎬 Video'
    case 'audio': return '🎵 Audio'
    case 'file': return `📎 ${message.media_name || 'File'}`
    default: return message.content || ''
  }
}

// Format typing indicator text
export function formatTypingText(names) {
  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} is typing...`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`
  return `${names[0]} and ${names.length - 1} others are typing...`
}

// Scroll to bottom smoothly
export function scrollToBottom(el, behavior = 'smooth') {
  if (el) {
    el.scrollTo({ top: el.scrollHeight, behavior })
  }
}

// Check if element is near bottom
export function isNearBottom(el, threshold = 100) {
  if (!el) return false
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

// Extract URLs from text
export function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text?.match(urlRegex) || []
}

// Linkify text
export function linkifyText(text) {
  if (!text) return ''
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, url => 
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-primary-600 dark:text-primary-400 hover:opacity-80">${url}</a>`
  )
}

// Color hash for avatar
export function stringToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#F5A151', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#01abc4', '#ee5a24', '#009432', '#833471',
  ]
  return colors[Math.abs(hash) % colors.length]
}
