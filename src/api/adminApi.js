import API from "./axiosInstance";

export const listUsers = async (role) => {
  const { data } = await API.get(`/admin/${role}`);
  return data;
};

export const approveUser = async (role, id, body) => {
  const { data } = await API.patch(`/admin/${role}/${id}/approve`, body);
  return data;
};

export const resetUserPassword = async (role, id, newPassword) => {
  const { data } = await API.patch(`/admin/${role}/${id}/reset-password`, { newPassword });
  return data;
};

export const updateUser = async (role, id, updates) => {
  const { data } = await API.patch(`/admin/${role}/${id}`, updates);
  return data;
};

export const deleteUser = async (role, id) => {
  const { data } = await API.delete(`/admin/${role}/${id}`);
  return data;
};

// School roles (admin)
export const createSchoolRole = async (name) => {
  const { data } = await API.post(`/admin/school-roles`, { name });
  return data;
};

export const updateSchoolRole = async (id, name) => {
  const { data } = await API.patch(`/admin/school-roles/update/${id}`, { name });
  return data;
};

export const deleteSchoolRole = async (id) => {
  const { data } = await API.delete(`/admin/school-roles/delete/${id}`);
  return data;
};

// Events (admin)
export const adminListEvents = async () => {
  const { data } = await API.get(`/admin/events`);
  return data;
};

export const adminCreateEvent = async (payload) => {
  const { data } = await API.post(`/admin/events`, payload);
  return data;
};

export const adminUpdateEvent = async (id, payload) => {
  const { data } = await API.patch(`/admin/events/${id}`, payload);
  return data;
};

export const adminDeleteEvent = async (id) => {
  const { data } = await API.delete(`/admin/events/${id}`);
  return data;
};

// District Events (admin)
export const adminListDistrictEvents = async () => {
  const { data } = await API.get(`/admin/district-events`);
  return data;
};

export const adminCreateDistrictEvent = async (payload) => {
  const { data } = await API.post(`/admin/district-events`, payload);
  return data;
};

export const adminUpdateDistrictEvent = async (id, payload) => {
  const { data } = await API.patch(`/admin/district-events/${id}`, payload);
  return data;
};

export const adminDeleteDistrictEvent = async (id) => {
  const { data } = await API.delete(`/admin/district-events/${id}`);
  return data;
};

// Announcements (admin)
export const adminListAnnouncements = async () => {
  const { data } = await API.get(`/admin/announcements`);
  return data;
};

export const adminCreateAnnouncement = async (payload) => {
  const { data } = await API.post(`/admin/announcements`, payload);
  return data;
};

export const adminUpdateAnnouncement = async (id, payload) => {
  const { data } = await API.patch(`/admin/announcements/${id}`, payload);
  return data;
};

export const adminDeleteAnnouncement = async (id) => {
  const { data } = await API.delete(`/admin/announcements/${id}`);
  return data;
};

// Evaluation Formats (admin)
export const getEvaluationFormat = async (scope, eventId) => {
  const { data } = await API.get(`/admin/evaluation-form`, { params: { scope, eventId } });
  return data;
};

export const saveEvaluationFormat = async (payload) => {
  const { data } = await API.post(`/admin/evaluation-form`, payload);
  return data;
};

export default { listUsers, approveUser, resetUserPassword, updateUser, deleteUser, createSchoolRole, updateSchoolRole, deleteSchoolRole, adminListEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent, adminListDistrictEvents, adminCreateDistrictEvent, adminUpdateDistrictEvent, adminDeleteDistrictEvent, adminListAnnouncements, adminCreateAnnouncement, adminUpdateAnnouncement, adminDeleteAnnouncement };
