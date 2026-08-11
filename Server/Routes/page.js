const experss = require('express');
const {
    createElement,
    createPage,
    getPage,
    listPages,
    editPage,
    deletePage,
    setDefaultPage,
} = require("../Controllers/pages")


const router = experss.Router();




router.post("/createElement",createElement)
router.post("/createPage",createPage)
router.get("/getPage/:id",getPage)
router.delete("/deletePage/:id",deletePage)
router.get("/listPages",listPages)
router.put("/editPage/:id",editPage)
router.put("/setDefaultPage/:id",setDefaultPage)


module.exports = router;