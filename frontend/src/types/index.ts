export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  address?: string;
  phone?: string;
  created_at: string;
}

export interface Contact {
  id: number;
  company_id: number;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  created_at: string;
}

export interface Assignment {
  id: number;
  user_id: number;
  company_id?: number;
  contact_id?: number;
  role: string;
  assigned_by?: number;
  assigned_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}
