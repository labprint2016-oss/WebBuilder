require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const {readdirSync} = require('fs')
const path = require('path')
const connectDB = require('./Config/connect');


const app = express();


app.use(cors());
app.use(morgan('dev'));
app.use(express.json())
app.use("/uploads",express.static(path.join(__dirname, "uploads")))
app.use("/uploadForBuilder",express.static(path.join(__dirname, "uploadForBuilder")))


connectDB(process.env.MONGO_URL);


readdirSync("./Routes").map((router)=>{
    app.use("/api",require(`./Routes/${router}`))
})

app.listen(5000,()=>{console.log("Port: 5000")})