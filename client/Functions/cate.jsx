import axios from "axios";
const URL = import.meta.env.VITE_API_URL


const api = axios.create({
    baseURL: URL
})


export const createCate = async(cate)=>{
   return await api.post("/createCate/",cate)
}


export const listCates = async()=>{
    return await api.get("/listCates/")
 }

 export const deleteCate = async(ids)=>{
    return await api.delete(`/deleteCate/`,{
       data:{ids}
    })
 }



 export const editCate = async(id,cate)=>{
   return await api.put(`/editCate/${id}`,cate)
}