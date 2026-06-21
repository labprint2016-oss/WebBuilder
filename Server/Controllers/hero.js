const Hero = require("../Models/hero")


exports.createHero = async(req,res)=>{
    try {
        const newHero = await Hero.create(req.body)
        res.send(newHero)
    } catch (error) {
        res.status(500).server("Server Error")
        console.log(error);
    }
}


exports.editHero = async(req,res)=>{
    try {
        const id = req.params.id
        const heroed = await Hero.findByIdAndUpdate(id,req.body,{new:true})
        res.send(heroed)
    } catch (error) {
        res.status(500).server("Server Error")
        console.log(error);
    }
}

exports.updateDesign = async(req,res)=>{
    try{


        const id = req.params.id 

         req.body.desktop = JSON.parse(req.body.desktop)
         req.body.mobile = JSON.parse(req.body.mobile)

       req.body.slideAmount = parseInt(req.body.slideAmount)
       req.body.mobileHeight = parseInt(req.body.mobileHeight)
       req.body.desktopHeight = parseInt(req.body.desktopHeight)
       req.body.dividerPosition = parseInt(req.body.dividerPosition)

       if(req.body.dividerColor.startsWith("#")){
                     req.body.dividerColor = req.body.dividerColor
                }else{
                   req.body.dividerColor = JSON.parse(req.body.dividerColor)
                }


        const designed = await Hero.findByIdAndUpdate(id,req.body,{new:true}).exec()

        res.send(designed)



    }catch(err){
        res.status(500).send("Server Error")
        console.log(err);
    }
}

exports.listHeros = async(req,res)=>{
    try {
        const heros = await Hero.find().exec()
        res.send(heros)
    } catch (error) {
        res.status(500).server("Server Error")
        console.log(error);
    }
}




exports.getHero = async(req,res)=>{
    try {
        const id = req.params.id
        const hero = await Hero.findById(id).exec()
        res.send(hero)
    } catch (error) {
        res.status(500).server("Server Error")
        console.log(error);
    }
}

exports.deleteHero = async(req,res)=>{
    try {

        const {ids} = req.body
        const deleted = await Hero.deleteMany({_id : {$in:ids}} )
        res.send(deleted)
    } catch (error) {
        res.status(500).server("Server Error")
        console.log(error);
    }
}