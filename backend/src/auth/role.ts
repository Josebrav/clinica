export type Role = 'SECRETARIA' | 'MEDICO' | 'JEFA';

export interface AuthUser {
  userId: string;
  username: string;
  role: Role;
  doctorId?: string;
}
