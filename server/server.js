require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Listener = require('./Listener')

mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', (error) => {console.log(error)})
db.once('open', () => {console.log("Connected to database.")})

app.use(express.json())

app.use(express.static('./views/'))

const deliveriesRouter = require('./routes/deliveries')
app.use('/deliveries', deliveriesRouter)

const url = process.env.SERVER_URL + "/deliveries"
const contractAddress = "0x1649b3506cc8ccd5e83cec3ffef0d3362f0cd854"
Listener.listen(contractAddress, url, () => {console.log("Listener initialized.")})

app.listen(3000, () => {console.log("Server started.")})
