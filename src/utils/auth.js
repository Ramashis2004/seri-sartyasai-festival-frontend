export const setAuth = ({ token, user }) => {
  if (token) sessionStorage.setItem("token", token);
  if (user) sessionStorage.setItem("user", JSON.stringify(user));
};

export const getToken = () => sessionStorage.getItem("token");

export const getUser = () => {
  const raw = sessionStorage.getItem("user");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};

export const clearAuth = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

export default { setAuth, getToken, getUser, clearAuth };
