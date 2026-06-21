const Post = require("../Models/post")


exports.createPost = async(req,res)=>{

    try {
        if(req.file){
            req.body.image = req.file.path
        }
        const JSON_FIELDs = ['title', 'link', 'columns', 'buttons',"description","color","textColor","category"];

        JSON_FIELDs.forEach(field => {
            if(typeof req.body[field] === "string" && req.body[field] !== ""){
                if(req.body[field].startsWith("#")){
                }else{
                    req.body[field] = JSON.parse(req.body[field])
                }
                
            }
        })

        const newPost = new Post(req.body)
        await newPost.save()
        res.send(newPost)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.listPosts = async(req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt:-1})
        res.send(posts)
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.getPost = async(req,res)=>{
    try {
        const id = req.params.id
        const post = await Post.findById(id).exec()
        res.send(post)
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.clonePost = async(req,res)=>{

    try {

        const date = Date.now().toString().slice(-6)
        req.body.title.text +=  " - " + date

        const newPost = new Post(req.body)
        await newPost.save()
        res.send(newPost)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.editPost = async(req,res)=>{

    try {
        const id = req.params.id

        if(req.file){
            req.body.image = req.file.path
        }
        const JSON_FIELDs = ['title', 'link', 'columns', 'buttons',"description","color","textColor","category"];

        JSON_FIELDs.forEach(field => {
            if(typeof req.body[field] === "string" && req.body[field] !== ""){
                if(req.body[field].startsWith("#")){
                }else{
                    req.body[field] = JSON.parse(req.body[field])
                }
                
            }
        })

        const posted = await Post.findByIdAndUpdate(id,req.body,{new:true})
        res.send(posted)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.deletePost = async(req,res)=>{

    try {
        const {ids} = req.body


        const removed = await Post.deleteMany({ _id: { $in: ids } }  )
        res.send(removed)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}