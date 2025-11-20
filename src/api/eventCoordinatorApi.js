import API from "./axiosInstance";

// Events visible to Event Coordinator
export const ecListSchoolEvents = async () => {
  const { data } = await API.get("/event-coordinator/events/school");
  return data;
};
export const ecListDistrictEvents = async () => {
  const { data } = await API.get("/event-coordinator/events/district");
  return data;
};

// Participants by event
export const ecListParticipants = async ({ scope, eventId }) => {
  const params = { scope, eventId };
  const { data } = await API.get("/event-coordinator/participants", { params });
  return data;
};

// Submit marks for participants
export const ecSubmitMarks = async ({ scope, eventId, items }) => {
  const payload = { scope, eventId, items };
  const { data } = await API.post("/event-coordinator/marks", payload);
  return data;
};

// Evaluation format for an event (read-only)
export const ecGetEvaluationFormat = async ({ scope, eventId }) => {
  const params = { scope, eventId };
  const { data } = await API.get("/event-coordinator/evaluation-form", { params });
  return data;
};

export default {
  ecListSchoolEvents,
  ecListDistrictEvents,
  ecListParticipants,
  ecSubmitMarks,
  ecGetEvaluationFormat,
};
