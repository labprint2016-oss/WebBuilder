const Theme = require("../Models/theme");


exports.createTheme = async(req,res)=>{
    try {
        
        const newTheme = await Theme().save()
        res.send(newTheme)

    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}

exports.getTheme = async(req,res)=>{
    try {

        const id = req.params.id
        const theme = await Theme.findOne({_id:id}).exec()
        res.send(theme)
        
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}


exports.updateTheme  = async(req,res)=>{
    try {

        const id = req.params.id
        const {themeData} = req.body
        const theme = await Theme.findOneAndUpdate({_id:id},themeData,{new:true}).exec()
        res.send(theme)
        
    } catch (error) {
        res.status(500).send("Server Error")
        console.log(error);
    }
}
