import axios from 'axios';
import { Location, LocationCreateRequest } from '../types/Location';

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

export const getAllLocations = async (): Promise<Location[]> => {
  try {
    const response = await axios.get(`${API_URL}/locations`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to fetch locations', error);
    throw error;
  }
};

export const getLocationById = async (id: number): Promise<Location> => {
  try {
    const response = await axios.get(`${API_URL}/locations/${id}`, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch location with id ${id}`, error);
    throw error;
  }
};

export const createLocation = async (locationData: LocationCreateRequest): Promise<Location> => {
  try {
    const response = await axios.post(`${API_URL}/locations`, locationData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error('Failed to create location', error);
    throw error;
  }
};

export const updateLocation = async (id: number, locationData: Location): Promise<Location> => {
  try {
    const response = await axios.put(`${API_URL}/locations/${id}`, locationData, getHeadersWithAuth());
    return response.data;
  } catch (error) {
    console.error(`Failed to update location with id ${id}`, error);
    throw error;
  }
};

export const deleteLocation = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/locations/${id}`, getHeadersWithAuth());
  } catch (error) {
    console.error(`Failed to delete location with id ${id}`, error);
    throw error;
  }
};
