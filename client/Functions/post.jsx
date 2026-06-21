import axios from "axios";
const URL = import.meta.env.VITE_API_URL


const api = axios.create({
    baseURL: URL
})

export const createPost = async(post)=>{
   return await api.post("/createPost/",post)
}

export const editPost = async(id,post)=>{
    return await api.put(`/editPost/${id}`,post)
 }

export const clonePost = async(post)=>{
    return await api.post("/clonePost/",post)
 }


export const listPosts = async()=>{
    return await api.get("/listPosts/")
 }

 export const getPost = async(id)=>{
    return await api.get(`/getPost/${id}`)
 }

 export const deletePost = async(ids)=>{
   return await api.delete(`/deletePost/`,{
      data:{ids}
   })
}
