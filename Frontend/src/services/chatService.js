import api from './api'

export const getConversations = () => api.get('/conversations')
export const getMessages = (conversationId) => api.get(`/conversations/${conversationId}/messages`)
export const sendMessage = (conversationId, message) => api.post(`/conversations/${conversationId}/messages`, { message })
