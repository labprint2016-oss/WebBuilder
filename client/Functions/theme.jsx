import axios from "axios";
const URL = import.meta.env.VITE_API_URL


const api = axios.create({
    baseURL: URL
})


export const createTheme = async ()=>{
    return await api.post("/createTheme")
}

export const getTheme = async (id)=>{
    return await api.get("/getTheme/"+id)
}


export const updateTheme = async (id,themeData)=>{
    return await api.put("/updateTheme/"+id,{themeData})
}

