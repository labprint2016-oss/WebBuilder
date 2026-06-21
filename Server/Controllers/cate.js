const Cate = require("../Models/category")



exports.createCate = async(req,res)=>{
    try {
        if(req.file){
            req.body.image = req.file.path
        }
            const newCate = await Cate.create(req.body)
            res.send(newCate)
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error")
    }
}


exports.listCates = async(req,res)=>{
    try {
        const cates = await Cate.find().sort({createAt:-1})
        res.send(cates)
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error")
    }
}


exports.deleteCate = async(req,res)=>{

    try {
        const {ids} = req.body


        const removed = await Cate.deleteMany({ _id: { $in: ids } }  )
        res.send(removed)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.editCate = async(req,res)=>{
    try {
        const id = req.params.id
        if(req.file){
            req.body.image = req.file.path
        }
            const cated = await Cate.findByIdAndUpdate(id,req.body,{new:true})
            res.send(cated)
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error")
    }
}
