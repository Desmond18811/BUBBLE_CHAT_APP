import axios from 'axios'
import { HOST } from '@/utills/constants'

const apiClient = axios.create({
  baseURL: HOST, // ✅ Note: it should be baseURL, not baseUrl
})

export default apiClient



