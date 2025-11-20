import API from "./axiosInstance";

export const getAllDistricts = async () => {
  const { data } = await API.get("/district/districts");
  return data;
};

export const getAllSchools = async (params = {}) => {
  const { data } = await API.get("/district/schools", { params });
  return data;
};

export const getSchoolsByDistrict = async (districtName) => {
  const { data } = await API.get(`/district/schools/${encodeURIComponent(districtName)}`);
  return data;
};

export const getSchoolRoles = async () => {
  const { data } = await API.get("/district/school-roles");
  return data;
};

export const approveSchool = async (id, body) => {
  const { data } = await API.patch(`/district/schools/${id}/approve`, body);
  return data;
};

export const createDistrict = async (payload) => {
  const { data } = await API.post("/district/districts", payload);
  return data;
};

export const updateDistrict = async (id, payload) => {
  const { data } = await API.patch(`/district/districts/${id}`, payload);
  return data;
};

export const deleteDistrict = async (id) => {
  const { data } = await API.delete(`/district/districts/${id}`);
  return data;
};

export const createSchool = async (payload) => {
  const { data } = await API.post("/district/schools", payload);
  return data;
};

export const updateSchool = async (id, payload) => {
  const { data } = await API.patch(`/district/schools/${id}`, payload);
  return data;
};

export const deleteSchool = async (id) => {
  const { data } = await API.delete(`/district/schools/${id}`);
  return data;
};

export default {
  getAllDistricts,
  getAllSchools,
  getSchoolsByDistrict,
  getSchoolRoles,
  approveSchool,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  createSchool,
  updateSchool,
  deleteSchool,
};
