export interface Employee {
  id: number;
  ptid: string;
  username: string;
  password: string;
  birth_date: string;
  address: string;
  location_id: number;
  join_date: string;
  phone: string;
  marital_status: string;
  is_admin: boolean;
  grade_id: number;
  name: string;
  job_position_id: number;
  email: string;
}

export interface CreateEmployee {
  username: string;
  password: string;
  birth_date: string;
  address: string;
  location_id: number;
  join_date: string;
  phone: string;
  marital_status: string;
  is_admin: boolean;
  grade_id: number;
  name: string;
  job_position_id: number;
  email: string;
}

export interface EmployeeRequest {
  ptid: string;
  username: string;
  old_username: string;
  birth_date: string;
  old_birth_date: string;
  address: string;
  old_address: string;
  location_id: number;
  old_location_id: number;
  phone: string;
  old_phone: string;
  marital_status: string;
  old_marital_status: string;
  grade_id: number;
  old_grade_id: number;
  name: string;
  old_name: string;
  job_position_id: number;
  old_job_position_id: number;
  email: string;
  old_email: string;
  status: string;
  rejection_reason?: string; 
  created_at: string;
  updated_at: string;
}

export interface RequestSummary {
  status: string;
  created_at: string;
}
