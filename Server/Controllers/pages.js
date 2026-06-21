const Page = require("../Models/pages")
const elements = require("../element")


exports.createElement = async(req,res)=>{
    try {

        const {element} = req.body
        res.send(elements[element] || "Element not found")

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.createPage = async(req,res)=>{
    try {
        const {pageName} = req.body
        const page = await Page.findOne({pageName}).exec()
        if(page) return res.status(400).send("Page already exists")
        const newPage = new Page({pageName})
        await newPage.save()
        res.send(newPage)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.editPage = async(req,res)=>{
    try {
        const id = req.params.id
        const page = await Page.findOneAndUpdate({_id:id},req.body,{new:true}).exec()
        res.send(page)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.deletePage = async(req,res)=>{
    try {
        const id = req.params.id
        const page = await Page.findOneAndDelete({_id:id}).exec()
        res.send(page)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.getPage = async(req,res)=>{
    try {

        const id = req.params.id
        const page = await Page.findOne({_id:id}).exec()
        res.send(page)
        
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.listPages = async(req,res)=>{
    try {

        const pages = await Page.find().sort({createdAt:-1})
        res.send(pages)
        
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}