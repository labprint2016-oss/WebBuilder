const express = require('express');
const {createPost,listPosts,clonePost,getPost,editPost,deletePost} =  require("../Controllers/post")
const upload = require("../MiddleWare/manageImg")

const router = express.Router();


router.post("/createPost/",upload,createPost)
router.put("/editPost/:id",upload,editPost)
router.get("/listPosts/",listPosts)
router.get("/getPost/:id",getPost)
router.post("/clonePost/",clonePost)
router.delete("/deletePost/",deletePost)


module.exports = router;