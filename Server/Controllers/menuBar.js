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
        const menuBar = await MenuBar.findById(id).exec()
        res.send(menuBar)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.updateMenuBar = async(req,res)=>{
    try {
        const id = req.params.id
        const menuBar = await MenuBar.findByIdAndUpdate(id,req.body,{new:true}).exec()
        res.send(menuBar)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}