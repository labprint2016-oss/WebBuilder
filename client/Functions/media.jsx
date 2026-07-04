import axios from "axios";

const URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: URL,
});

export const uploadImage = async (image) => {
  return await api.post("/uploadImage", image);
};

export const listImages = async () => {
  return await api.get("/listImages");
};

export const deleteImage = async (img) => {
  const safeFileName = encodeURIComponent(String(img || ""));
  return await api.delete(`/deleteImage/${safeFileName}`);
};

export const getImage = async (img) => {
  return await api.get(`/getImage/${img}`);
};
