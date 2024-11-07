export type ProblemStatus = 'RELATADO' | 'EM_ANALISE' | 'RESOLVIDO';

export interface CreateReportedProblemRequest {
  device: number; 
  description: string;
  image?: string | null;
  status: ProblemStatus;
}