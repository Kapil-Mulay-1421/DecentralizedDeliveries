const mongoose = require('mongoose')

const deliverySchema = new mongoose.Schema({
    _id: {type: String, required: true}, 
    to: {type: String, required: true}, 
    from: {type: String, required: true}, 
    item: {type: String, required: true}, 
    payment: {type: String, required: true}, 
    status: {type: String, required: true}, 
    customer: {type: String, required: true}, 
    deliveryMan: {type: String, default: null}
})

module.exports = mongoose.model('Delivery', deliverySchema)