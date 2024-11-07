import { api } from '../utils/api'
import {
  CreateReportedProblemRequest,
} from './types'

export async function reportProblem(token: string, createReportedProblemRequest: CreateReportedProblemRequest): Promise<CreateReportedProblemRequest> {
  const response = await api.post('/problems/', createReportedProblemRequest, {
    headers: {
      'Authorization': `Bearer ${token}`,  
      'Content-Type': 'application/json',
    },
  });
  return {
    ...response.data,
  }
}