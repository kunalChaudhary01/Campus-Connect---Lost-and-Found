import api from './api'

export const getPosts = (params = {}) => api.get('/posts', { params })
export const getPost = (id) => api.get(`/posts/${id}`)
export const createPost = (payload) => api.post('/posts', payload)
export const deletePost = (id) => api.delete(`/posts/${id}`)
export const resolvePost = (id) => api.put(`/posts/${id}/resolve`)
