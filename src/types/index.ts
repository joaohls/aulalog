export interface Aula {
  id: string;
  user_id: string;
  titulo: string;
  disciplina: string;
  professor: string;
  data: string; // ISO date
  resumo: string;
  duracao_minutos?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
}

export interface Stats {
  totalAulas: number;
  uniqueDisciplinas: number;
  ultimaAula: string | null;
}
