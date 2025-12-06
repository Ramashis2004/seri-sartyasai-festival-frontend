import API from "./axiosInstance";

export const itListParticipants = async (params = {}) => {
  const { data } = await API.get("/api/it-admin/participants", { params });
  return data;
};

export const itUpdateParticipant = async (id, payload) => {
  const { data } = await API.patch(`/api/it-admin/participants/${id}`, payload);
  return data;
};

export const itDeleteParticipant = async (id,source) => {
  const { data } = await API.delete(`/api/it-admin/participants/${id}?source=${source}`);
  return data;
};

export const itFinalizeParticipants = async (payload) => {
  const { data } = await API.post(`/api/it-admin/participants/finalize`, payload);
  return data;
};

// IT Admin: Create participant (school or district) by passing { source: 'school'|'district', ...fields }
export const itCreateParticipant = async (payload) => {
  const { data } = await API.post(`/api/it-admin/participants`, payload);
  return data;
};

export const itListTeachers = async (params = {}) => {
  const { data } = await API.get("/api/it-admin/teachers", { params });
  return data;
};

export const itUpdateTeacher = async (id, payload) => {
  const { data } = await API.patch(`/api/it-admin/teachers/${id}`, payload);
  return data;
};

export const itDeleteTeacher = async (id,source) => {
  const { data } = await API.delete(`/api/it-admin/teachers/${id}?source=${source}`);
  return data;
};

export const itFinalizeTeachers = async (payload) => {
  const { data } = await API.post(`/api/it-admin/teachers/finalize`, payload);
  return data;
};

// IT Admin: Create accompanying teacher/guru
export const itCreateTeacher = async (payload) => {
  const { data } = await API.post(`/api/it-admin/teachers`, payload);
  return data;
};

// IT Admin: Read-only event listings for filters
export const itListEvents = async () => {
  const { data } = await API.get(`/api/it-admin/events`);
  return data;
};

export const itListDistrictEvents = async () => {
  const { data } = await API.get(`/api/it-admin/district-events`);
  return data;
};

export const itGetOverviewMetrics = async (params = {}) => {
  const { data } = await API.get(`/api/it-admin/overview/metrics`, { params });
  return data;
};

export const itGetNotReported = async (params = {}) => {
  const { data } = await API.get(`/api/it-admin/overview/not-reported`, { params });
  return data;
};

export const itGetStudentsYetToReport = async (params = {}) => {
  const { data } = await API.get(`/api/it-admin/overview/students-yet-to-report`, { params });
  return data;
};

export const itGetTeachersOverview = async (params = {}) => {
  const { data } = await API.get(`/api/it-admin/overview/teachers`, { params });
  return data;
};

export const itGetParticipantsByDistrictReport = async (params = {}) => {
  const { data } = await API.get(`/api/it-admin/reports/participants-by-district`, { params });
  return data;
};

export const itGetTeachersByDistrictReport = async (params = {}) => {
  const { data } = await API.get(`/api/it-admin/reports/teachers-by-district`, { params });
  return data;
};

export const itGetTeachersBySchoolReport = async (params = {}) => {
  const { data } = await API.get(`/api/it-admin/reports/teachers-by-school`, { params });
  return data;
};

export default { itListParticipants, itUpdateParticipant, itFinalizeParticipants, itCreateParticipant, itListTeachers, itUpdateTeacher, itFinalizeTeachers, itCreateTeacher, itListEvents, itListDistrictEvents, itGetOverviewMetrics, itGetNotReported, itGetStudentsYetToReport, itGetTeachersOverview, itGetParticipantsByDistrictReport, itGetTeachersByDistrictReport, itGetTeachersBySchoolReport };
