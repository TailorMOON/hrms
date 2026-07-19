import axios from 'axios';
import { JobPosition, JobCreateRequest } from '../types/JobPosition';

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

export const getAllJobPositions = async (): Promise<JobPosition[]> => {
  try {
    const response = await axios.get(`${API_URL}/jobpositions`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to fetch job positions', error);
    throw error;
  }
};

export const getJobPositionById = async (id: number): Promise<JobPosition> => {
  try {
    const response = await axios.get(`${API_URL}/jobpositions/${id}`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch job position with id ${id}`, error);
    throw error;
  }
};

export const createJobPosition = async (jobPositionData: JobCreateRequest): Promise<JobPosition> => {
  try {
    const response = await axios.post(`${API_URL}/jobpositions`, jobPositionData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to create job position', error);
    throw error;
  }
};

export const updateJobPosition = async (id: number, jobPositionData: JobPosition): Promise<JobPosition> => {
  try {
    const response = await axios.put(`${API_URL}/jobpositions/${id}`, jobPositionData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to update job position with id ${id}`, error);
    throw error;
  }
};

export const deleteJobPosition = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/jobpositions/${id}`, getHeadersWithAuth());
  } catch (error) {
    console.error(`Failed to delete job position with id ${id}`, error);
    throw error;
  }
};
