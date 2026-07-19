import axios from 'axios';
import { Grade, GradeCreateRequest } from '../types/Grade';

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

export const getAllGrades = async (): Promise<Grade[]> => {
  try {
    const response = await axios.get(`${API_URL}/grades`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to fetch grades', error);
    throw error;
  }
};

export const getGradeById = async (id: number): Promise<Grade> => {
  try {
    const response = await axios.get(`${API_URL}/grades/${id}`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch grade with id ${id}`, error);
    throw error;
  }
};

export const createGrade = async (gradeData: GradeCreateRequest): Promise<Grade> => {
  try {
    const response = await axios.post(`${API_URL}/grades`, gradeData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to create grade', error);
    throw error;
  }
};

export const updateGrade = async (id: number, gradeData: Grade): Promise<Grade> => {
  try {
    const response = await axios.put(`${API_URL}/grades/${id}`, gradeData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to update grade with id ${id}`, error);
    throw error;
  }
};

export const deleteGrade = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/grades/${id}`, getHeadersWithAuth());
  } catch (error) {
    console.error(`Failed to delete grade with id ${id}`, error);
    throw error;
  }
};
