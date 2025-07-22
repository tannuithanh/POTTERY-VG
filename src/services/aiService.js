import api from '@/plugins/axios-user'

export const chatWithAI = async (messages) => {
  const res = await api.post('/chat', { messages })
  return res.data
}
