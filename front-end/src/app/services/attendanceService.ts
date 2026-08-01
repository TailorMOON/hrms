import axios from 'axios';
import { Attendance, AttendanceRequest } from '../types/Attendance';

const API_URL = 'http://localhost:8080';

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const getHeadersWithAuth = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authorization token found');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAttendances = async (): Promise<Attendance[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendances', error);
    throw error;
  }
};

export const getAttendanceById = async (id: number): Promise<Attendance> => {
  try {
    const response = await axios.get(`${API_URL}/attendance/${id}`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance with id ${id}`, error);
    throw error;
  }
};

export const getAttendanceByDate = async (
  employeeId: string,
  startDate: string,
  endDate: string,
  limit: number = 10,
  offset: number = 0
): Promise<Attendance[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance/employee/${employeeId}`, {
      params: { startDate, endDate, limit, offset },
      ...getHeadersWithAuth(),
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance for employee ${employeeId} between ${startDate} and ${endDate}`, error);
    throw error;
  }
};

export const getAllReqAttendance = async (): Promise<AttendanceRequest[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance/request`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance update requests', error);
    throw error;
  }
};

export const getReqAttendanceByNIP = async (employeeId: string): Promise<AttendanceRequest[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance/request/${employeeId}`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance requests for employee ${employeeId}`, error);
    throw error;
  }
};

export const createAttendance = async (attendanceData: Attendance): Promise<Attendance> => {
  try {
    const response = await axios.post(`${API_URL}/attendance`, attendanceData);
    return response.data;
  } catch (error) {
    console.error('Failed to create attendance', error);
    throw error;
  }
};

export const createReqAttendance = async (attendanceData: Partial<AttendanceRequest>): Promise<void> => {
  try {
    await axios.post(`${API_URL}/attendance/request`, attendanceData, getHeadersWithAuth());
  } catch (error) {
    console.error('Failed to create attendance request', error);
    throw error;
  }
};

export const updateAttendance = async (id: number, attendanceData: Attendance): Promise<Attendance> => {
  try {
    const response = await axios.put(`${API_URL}/attendance/${id}`, attendanceData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update attendance with id ${id}`, error);
    throw error;
  }
};

export const updateReqAttendanceStatus = async (id: number, status: string, rejection_reason?: string): Promise<void> => {
  try {
    const data: { status: string; rejection_reason?: string } = { status };
    if (status === "Rejected" && rejection_reason) {
      data.rejection_reason = rejection_reason;
    }
    console.log("Data being sent to the backend:", data);
    await axios.put(`${API_URL}/attendance/request/${id}/status`, data, getHeadersWithAuth());
  } catch (error) {
    console.error('Failed to update attendance request status', error);
    throw error;
  }
};

export const deleteAttendance = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/attendance/${id}`, getHeadersWithAuth());
  } catch (error) {
    console.error(`Failed to delete attendance with id ${id}`, error);
    throw error;
  }
};