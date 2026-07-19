import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const login = async (nip: string, password: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { nip, password });
    
    if (response.data.token) {
      localStorage.setItem('id', response.data.id);
      localStorage.setItem('ptid', nip);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('isAdmin', response.data.is_admin ? 'true' : 'false');
    }

    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = (): void => {
  try {
    localStorage.removeItem('id');
    localStorage.removeItem('ptid');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin'); 
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
