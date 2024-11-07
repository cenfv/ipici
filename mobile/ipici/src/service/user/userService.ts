import { api } from '../utils/api'
import {
  ResetPassword,
  User,
} from './types'

export async function register(user: User): Promise<User> {
  const response = await api.post('/users/', user)
  return {
    ...response.data,
  }
}

export async function resetPassword(resetPassword: ResetPassword): Promise<ResetPassword> {
  const response = await api.post('/user/password_reset_request/', resetPassword)
  return {
    ...response.data,
  }
}

export async function getUserByBearer(token: string): Promise<User> {
  const response = await api.get('/users/me/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
