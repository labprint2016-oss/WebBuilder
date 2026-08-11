import "axios";
import axios from "axios";
const URL = import.meta.env.VITE_API_URL


const api = axios.create({
    baseURL: URL
})

export const createElement = async (element)=>{
    return await api.post("/createElement",{element})
}

export const createPage = async(pageName)=>{
    return await api.post("/createPage",pageName)
}

export const editPage = async(data,id)=>{
    return await api.put(`/editPage/${id}`,data)
}

export const getPage = async (id)=>{
    return await api.get("/getPage/"+id)
}

export const deletePage = async (id)=>{
    return await api.delete("/deletePage/"+id)
}

export const setDefaultPage = async (id)=>{
    return await api.put("/setDefaultPage/"+id)
}


export const listPages = async ()=>{
    return await api.get("/listPages")
}