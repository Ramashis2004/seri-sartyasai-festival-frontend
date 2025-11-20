import API from "./axiosInstance";

export const login = async (role, credentials) => {
  const { data } = await API.post(`/${role}/login`, credentials);
  return data; // { message, token, user }
};

export const register = async (role, payload) => {
  const { data } = await API.post(`/${role}/register`, payload);
  return data; // { message, user }
};

export const forgotPassword = async (role, email) => {
  const { data } = await API.post(`/${role}/forgot-password`, { email });
  return data; // { message }
};

export const resetPasswordWithToken = async (role, body) => {
  const { data } = await API.post(`/${role}/reset-password`, body);
  return data; // { message }
};

export default { login, register, forgotPassword, resetPasswordWithToken };
