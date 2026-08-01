export interface Attendance {
  id?: number;
  employee_id: string;
  date: string;
  check_in_time: string | null;
  is_late: boolean;
  check_out_time: string | null;
}
  
export interface AttendanceRequest {
  id: number;
  employee_id: string;
  request_date: string;
  check_in_time: string;
  check_out_time: string;
  reason: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}
  