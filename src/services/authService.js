import apiClient from './apiClient';

export async function loginUser(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
}

export async function signupUser(payload) {
  const { data } = await apiClient.post('/auth/signup', payload);
  return data;
}
