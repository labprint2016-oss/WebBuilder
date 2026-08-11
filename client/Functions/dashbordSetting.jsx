import axios from "axios";

const URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: URL,
});

const DEFAULT_KEY = "default";

export const getDashbordSetting = async (key = DEFAULT_KEY) => {
  return await api.get(`/getDashbordSetting/${encodeURIComponent(key)}`);
};

export const updateDashbordSetting = async (setting, key = DEFAULT_KEY) => {
  return await api.put(`/updateDashbordSetting/${encodeURIComponent(key)}`, {
    setting,
  });
};
