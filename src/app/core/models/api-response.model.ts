import { Role } from '../constants/roles.constants';

export interface ApiResponse<T> {
  role: Role;
  success: boolean;
  message: string;
  data: T;
  token?: string;
  errors?: any;
}