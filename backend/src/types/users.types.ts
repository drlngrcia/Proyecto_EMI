export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  active: boolean;
  created_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role: 'admin' | 'staff';
}
