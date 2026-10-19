import api from './api'

export const createRequest = (payload) => api.post('/requests', payload)
export const getRequests = () => api.get('/requests')
export const decideRequest = (id, action) => api.put(`/requests/${id}/${action}`)
