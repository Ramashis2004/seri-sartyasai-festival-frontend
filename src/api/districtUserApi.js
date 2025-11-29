import API from "./axiosInstance";

// District user: Events
export const duListEvents = async () => {
  const { data } = await API.get("/api/district-user/events");
  return data;
};

// District user: Participants
export const duListParticipants = async (eventId) => {
  const params = eventId ? { eventId } : {};
  const { data } = await API.get("/api/district-user/participants", { params });
  return data;
};
export const duCreateParticipant = async (payload) => {
  const { data } = await API.post("/api/district-user/participants", payload);
  return data;
};
export const duUpdateParticipant = async (id, payload) => {
  const { data } = await API.patch(`/api/district-user/participants/${id}`, payload);
  return data;
};
export const duDeleteParticipant = async (id) => {
  const { data } = await API.delete(`/api/district-user/participants/${id}`);
  return data;
};

// District user: Accompanying Guru (Teachers)
export const duListTeachers = async () => {
  const { data } = await API.get("/api/district-user/teachers");
  return data;
};
export const duCreateTeacher = async (payload) => {
  const { data } = await API.post("/api/district-user/teachers", payload);
  return data;
};
export const duUpdateTeacher = async (id, payload) => {
  const { data } = await API.patch(`/api/district-user/teachers/${id}`, payload);
  return data;
};
export const duDeleteTeacher = async (id) => {
  const { data } = await API.delete(`/api/district-user/teachers/delete/${id}`);
  return data;
};

export default {
  duListEvents,
  duListParticipants,
  duCreateParticipant,
  duUpdateParticipant,
  duDeleteParticipant,
  duListTeachers,
  duCreateTeacher,
  duUpdateTeacher,
  duDeleteTeacher,
};
