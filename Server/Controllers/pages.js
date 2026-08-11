const Page = require("../Models/pages")
const elements = require("../element")

const normalizePageName = (value) => String(value || "").trim();

const toBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "true" || normalized === "1";
    }
    return false;
};

const ensureDefaultPageExists = async () => {
    const hasDefaultPage = await Page.exists({ isDefault: true });
    if (hasDefaultPage) return;

    const fallbackPage = await Page.findOne().sort({ createdAt: 1 }).exec();
    if (!fallbackPage?._id) return;

    await Page.updateOne({ _id: fallbackPage._id }, { $set: { isDefault: true } }).exec();
};


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
        const pageName = normalizePageName(req.body?.pageName)
        if(pageName.length < 3){
            return res.status(400).send("Page name is too short")
        }

        const page = await Page.findOne({pageName}).exec()
        if(page) return res.status(400).send("Page already exists")

        const hasDefaultPage = await Page.exists({ isDefault: true });
        const newPage = new Page({
            pageName,
            layouts: [],
            latestID: 0,
            isDefault: !hasDefaultPage,
        })
        await newPage.save()
        res.send(newPage)

    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).send("Page already exists");
        }
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.editPage = async(req,res)=>{
    try {
        const id = req.params.id
        const payload = { ...(req.body || {}) };
        delete payload._id;
        delete payload.createdAt;
        delete payload.updatedAt;

        if (Object.prototype.hasOwnProperty.call(payload, "pageName")) {
            payload.pageName = normalizePageName(payload.pageName);
            if (payload.pageName.length < 3) {
                return res.status(400).send("Page name is too short");
            }
            const duplicate = await Page.findOne({
                pageName: payload.pageName,
                _id: { $ne: id },
            }).select("_id").exec();
            if (duplicate) {
                return res.status(400).send("Page already exists");
            }
        }

        if (Object.prototype.hasOwnProperty.call(payload, "isDefault")) {
            payload.isDefault = toBoolean(payload.isDefault);
            if (payload.isDefault) {
                await Page.updateMany(
                    { _id: { $ne: id }, isDefault: true },
                    { $set: { isDefault: false } }
                ).exec();
            }
        }

        const page = await Page.findOneAndUpdate(
            {_id:id},
            {$set: payload},
            {new:true, runValidators:true}
        ).exec()
        if (!page) return res.status(404).send("Page not found");

        await ensureDefaultPageExists();
        const latestPage = await Page.findById(page._id).exec();
        res.send(latestPage || page)

    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).send("Page already exists");
        }
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.deletePage = async(req,res)=>{
    try {
        const id = req.params.id
        const page = await Page.findOneAndDelete({_id:id}).exec()
        if (!page) return res.status(404).send("Page not found");

        if (page.isDefault) {
            await ensureDefaultPageExists();
        }
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
        if (!page) return res.status(404).send("Page not found");
        res.send(page)
        
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.listPages = async(req,res)=>{
    try {

        const pages = await Page.find().sort({isDefault:-1,createdAt:-1})
        res.send(pages)
        
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.setDefaultPage = async(req,res)=>{
    try {
        const id = req.params.id;
        const targetPage = await Page.findOne({ _id: id }).exec();
        if (!targetPage) return res.status(404).send("Page not found");

        await Page.updateMany({ isDefault: true }, { $set: { isDefault: false } }).exec();
        const updatedPage = await Page.findOneAndUpdate(
            { _id: id },
            { $set: { isDefault: true } },
            { new: true }
        ).exec();

        res.send(updatedPage);
    } catch (error) {
        res.status(500).send("Server Error");
        console.log(error);
    }
}