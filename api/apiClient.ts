import axios from 'axios'
import { getAuthToken } from '../services/authStorage'

export type AuthStrategy = 'jwt' | 'api-key' | 'none'

type RequestConfig = {
  authStrategy?: AuthStrategy
  apiKey?: string
}

const apiClient = axios.create()

apiClient.interceptors.request.use(
  async (config) => {
    const customConfig = config as typeof config & RequestConfig

    const strategy = customConfig.authStrategy || 'none'

    if (!config.headers) {
      config.headers = {}
    }

    if (strategy === 'jwt') {
      const token = await getAuthToken()

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    if (strategy === 'api-key' && customConfig.apiKey) {
      config.headers['x-api-key'] = customConfig.apiKey
    }

    console.log(
      `[API REQUEST]: ${config.method?.toUpperCase()} ${config.url}`
    )

    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API RESPONSE]: ${response.status} ${response.config.url}`
    )

    return response
  },
  (error) => {
    console.log(
      `[API ERROR]: ${error.response?.status}`
    )

    return Promise.reject(error)
  }
)

export default apiClient