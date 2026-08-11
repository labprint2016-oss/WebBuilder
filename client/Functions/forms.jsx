import axios from "axios";

const URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: URL,
});

export const getForms = async (menuBarId) => {
  return await api.get(`/getForms/${menuBarId}`);
};

export const updateForms = async (menuBarId, data) => {
  return await api.put(`/updateForms/${menuBarId}`, data);
};

export const createFormResponse = async (data) => {
  return await api.post(`/createFormResponse`, data);
};

export const getFormResponses = async (menuBarId, formPresetId) => {
  const params =
    formPresetId != null && String(formPresetId).trim()
      ? { formPresetId: String(formPresetId).trim() }
      : undefined;
  return await api.get(`/getFormResponses/${menuBarId}`, { params });
};

export const deleteFormResponse = async (id) => {
  return await api.delete(`/deleteFormResponse/${id}`);
};

export const updateFormResponse = async (id, data) => {
  return await api.put(`/updateFormResponse/${id}`, data);
};
