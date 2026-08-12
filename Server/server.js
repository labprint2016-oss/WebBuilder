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
// หน้า Builder ที่มี Section/Element เยอะส่ง JSON ใหญ่ — ค่า default 100kb ไม่พอ
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads",express.static(path.join(__dirname, "uploads")))
app.use("/uploadForBuilder",express.static(path.join(__dirname, "uploadForBuilder")))


connectDB(process.env.MONGO_URL);


readdirSync("./Routes").map((router)=>{
    app.use("/api",require(`./Routes/${router}`))
})

app.listen(5000,()=>{console.log("Port: 5000")})