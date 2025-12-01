import API from "./axiosInstance";

// Events
export const listEvents = () => API.get("/api/school/events").then(r => r.data);
export const getEvent = (id) => API.get(`/api/school/events/${id}`).then(r => r.data);
export const createEvent = (payload) => API.post("/api/school/events", payload).then(r => r.data);
export const updateEvent = (id, payload) => API.patch(`/api/school/events/${id}`, payload).then(r => r.data);
export const deleteEvent = (id) => API.delete(`/api/school/events/${id}`).then(r => r.data);
// Participants
export const listParticipants = (eventId) => API.get("/api/school/participants", { params: eventId ? { eventId } : {} }).then(r => r.data);
export const createParticipant = (payload) => API.post("/api/school/participants", payload).then(r => r.data);
export const assignTeacherToParticipant = (payload) => API.post("/api/school/participants/assign-teacher", payload).then(r => r.data);
export const updateParticipant = (id, payload) => API.patch(`/api/school/participants/${id}`, payload).then(r => r.data);
export const deleteParticipant = (id) => API.delete(`/api/school/participants/${id}`).then(r => r.data);

// Teachers
export const listTeachers = () => API.get("/api/school/teachers").then(r => r.data);
export const createTeacher = (payload) => API.post("/api/school/teachers", payload).then(r => r.data);
export const updateTeacher = (id, payload) => API.patch(`/api/school/teachers/${id}`, payload).then(r => r.data);
export const deleteTeacher = (id) => API.delete(`/api/school/teachers/delete/${id}`).then(r => r.data);