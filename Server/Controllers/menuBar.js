const MenuBar = require("../Models/menuBar")


exports.createMenuBar = async(req,res)=>{
    try {
        const newMenuBar = await MenuBar.create({})
        res.json(newMenuBar)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.getMenuBar = async(req,res)=>{
    try {
        const id = req.params.id
        const menuBar = await MenuBar.findById(id).lean().exec()
        if (!menuBar) return res.status(404).send("Menu bar not found")
        res.send(menuBar)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.updateMenuBar = async(req,res)=>{
    try {
        const id = req.params.id
        const result = await MenuBar.updateOne(
            { _id: id },
            { $set: req.body }
        ).exec()
        if (result.matchedCount === 0) return res.status(404).send("Menu bar not found")
        res.status(204).end()

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}