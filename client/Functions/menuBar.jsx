import axios from "axios";
const URL = import.meta.env.VITE_API_URL


const api = axios.create({
    baseURL: URL
})

export const getMenuBar = async(id)=>{
    return await api.get(`/getMenuBar/${id}`)
}

export const updateMenuBar = async(data,id)=>{
    return await api.put(`/updateMenuBar/${id}`,data)
}