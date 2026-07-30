import axios from 'axios';
import { Employee, CreateEmployee, EmployeeRequest } from '../types/Employee';

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

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await axios.get(`${API_URL}/employees`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to fetch employees', error);
    throw error;
  }
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
  try {
    const response = await axios.get(`${API_URL}/employees/${id}`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch employee with id ${id}`, error);
    throw error;
  }
};

export const getEmployeeByNIP = async (nip: string): Promise<Employee> => {
  try {
      const response = await axios.get(`${API_URL}/employee/nip/${nip}`);
      return response.data;
  } catch (error) {
      console.error(`Failed to fetch employee with NIP ${nip}`, error);
      throw error;
  }
};

export const getAllReqUpdateEmployee = async (): Promise<EmployeeRequest[]> => {
  try {
    const response = await axios.get(`${API_URL}/employees/request`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to fetch employee update requests', error);
    throw error;
  }
};

export const getReqUpdateEmployeeByNIP = async (nip: string): Promise<{ status: string; created_at: string }> => {
  try {
    const response = await axios.get(`${API_URL}/employees/request/${nip}`, getHeadersWithAuth());
    return {
      status: response.data.status,
      created_at: response.data.created_at
    };
  } catch (error) {
    console.error(`Failed to fetch request update by NIP ${nip}`, error);
    throw error;
  }
};

export const createEmployee = async (employeeData: CreateEmployee): Promise<Employee> => {
  try {
    const response = await axios.post(`${API_URL}/employees`, employeeData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to create employee', error);
    throw error;
  }
};

export const createReqUpdateEmployee = async (data: Partial<EmployeeRequest>): Promise<void> => {
  try {
    await axios.post(`${API_URL}/employees/request`, data, getHeadersWithAuth());
  } catch (error) {
    console.error('Failed creating personal info update request', error);
    throw error;
  }
};

export const updateEmployee = async (id: number, employeeData: Employee): Promise<Employee> => {
  try {
    const response = await axios.put(`${API_URL}/employees/${id}`, employeeData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to update employee with id ${id}`, error);
    throw error;
  }
};

export const updateReqUpdateEmployeeStatus = async (ptid: string, status: string, reason?: string): Promise<void> => {
  try {
    const data: { status: string; rejection_reason?: string } = { status };
    if (status === "Rejected" && reason) {
      data.rejection_reason = reason;
    }
    console.log("Data being sent to the backend:", data);
    await axios.put(`${API_URL}/employees/request/${ptid}/status`, data, getHeadersWithAuth());
  } catch (error) {
    console.error('Failed to update employee update request status', error);
    throw error;
  }
};

export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/employees/${id}`, getHeadersWithAuth());
  } catch (error) {
    console.error(`Failed to delete employee with id ${id}`, error);
    throw error;
  }
};

export const deleteReqUpdateEmployee = async (nip: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/employees/request/${nip}`, getHeadersWithAuth());
  } catch (error) {
    console.error(`Failed to delete employee update request with id ${nip}`, error);
    throw error;
  }
};