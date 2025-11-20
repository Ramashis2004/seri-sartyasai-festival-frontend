import API from "./axiosInstance";

// Events
export const listEvents = () => API.get("/school/events").then(r => r.data);
export const getEvent = (id) => API.get(`/school/events/${id}`).then(r => r.data);
export const createEvent = (payload) => API.post("/school/events", payload).then(r => r.data);
export const updateEvent = (id, payload) => API.patch(`/school/events/${id}`, payload).then(r => r.data);
export const deleteEvent = (id) => API.delete(`/school/events/${id}`).then(r => r.data);

// Participants
export const listParticipants = (eventId) => API.get("/school/participants", { params: eventId ? { eventId } : {} }).then(r => r.data);
export const createParticipant = (payload) => API.post("/school/participants", payload).then(r => r.data);
export const assignTeacherToParticipant = (payload) => API.post("/school/participants/assign-teacher", payload).then(r => r.data);
export const updateParticipant = (id, payload) => API.patch(`/school/participants/${id}`, payload).then(r => r.data);
export const deleteParticipant = (id) => API.delete(`/school/participants/${id}`).then(r => r.data);

// Teachers
export const listTeachers = () => API.get("/school/teachers").then(r => r.data);
export const createTeacher = (payload) => API.post("/school/teachers", payload).then(r => r.data);
export const updateTeacher = (id, payload) => API.patch(`/school/teachers/${id}`, payload).then(r => r.data);
export const deleteTeacher = (id) => API.delete(`/school/teachers/delete/${id}`).then(r => r.data);
