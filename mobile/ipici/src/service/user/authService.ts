import { api } from '../utils/api'
import {
  Auth,
  AuthResponse,
} from './types'

export async function login(credentials: Auth): Promise<AuthResponse> {
  const response = await api.post('/auth/', credentials)
  return {
    data: response.data,
  }
}
