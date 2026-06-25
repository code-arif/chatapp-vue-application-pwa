import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echo = null

export const initEcho = () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,

        authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            }
        }
    })

    return echo
}

export const getEcho = () => echo

export const disconnectEcho = () => {
    if (echo) {
        echo.disconnect()
        echo = null
    }
}

// ==========================
// Conversation Channels
// ==========================
export const subscribeToConversation = (conversationId, callbacks) => {
    if (!echo) return null

    const channel = echo.join(`conversation.${conversationId}`)
        .listen('.message.sent', callbacks.onMessageSent || (() => {}))
        .listen('.message.updated', callbacks.onMessageUpdated || (() => {}))
        .listen('.message.deleted', callbacks.onMessageDeleted || (() => {}))
        .listen('.message.read', callbacks.onMessageRead || (() => {}))
        .listen('.message.reaction', callbacks.onReaction || (() => {}))
        .listen('.user.typing', callbacks.onTyping || (() => {}))

    return channel
}

export const leaveConversation = (conversationId) => {
    if (echo) {
        echo.leave(`conversation.${conversationId}`)
    }
}

// ==========================
// Global Users Channel
// ==========================
export const subscribeToUsers = (callback) => {
    if (!echo) return null

    return echo.channel('users')
        .listen('.user.status.changed', callback)
}

export default {
    initEcho,
    getEcho,
    disconnectEcho,
    subscribeToConversation,
    leaveConversation,
    subscribeToUsers
}