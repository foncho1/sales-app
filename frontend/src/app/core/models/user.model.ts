export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export type UserRole = 'USER' | 'ADMIN';

export interface UserCreate {

  username: string;

  email: string;

  password: string;

  role: UserRole;

}

export interface UserUpdate {

  username: string;

  email: string;

  role: UserRole;

}
