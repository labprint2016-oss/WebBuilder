import axios from "axios";
const URL = import.meta.env.VITE_API_URL


const api = axios.create({
    baseURL: URL
})

export const createHero = async(hero)=>{
   return await api.post("/createHero/",hero)
}

export const uploadImage = async(image)=>{
   return await api.post("/uploadImage",image)
}


export const editHero = async(hero,id)=>{
    return await api.put(`/editHero/${id}`,hero)
 }

 export const updateDesign = async(hero,id)=>{
   return await api.put(`/updateDesign/${id}`,hero)
}
 
export const listHeros = async()=>{
    return await api.get("/listHeros/")
 }

 export const listImages = async()=>{
   return await api.get("/listImages")
}
export const deleteImage = async(img)=>{
   return await api.delete(`/deleteImage/${img}`)
}

export const getImage = async(img)=>{
   return await api.get(`/getImage/${img}`)
}

 export const getHero = async(id)=>{
    return await api.get(`/getHero/${id}`)
 }


 export const deleteHero = async(ids)=>{
    return await api.delete("/deleteHero/",{
        data:{ids}
    })
 }