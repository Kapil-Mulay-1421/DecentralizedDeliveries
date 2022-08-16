const express = require('express')
const router = express.Router()
const Delivery = require('../models/delivery')

router.get('/', async (req, res) => {
    try {
        const deliveries = await Delivery.find()
        res.json(deliveries)
    } catch(error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/:id', getDelivery, (req, res) => {
    res.send(res.delivery)
})

router.get("/address/:userAddress", async (req, res) => {
    const customer = req.params.userAddress
    try {
        const deliveries = await Delivery.find({$and: [{"customer": customer}, {"status": {$lt: 3}}]})
        res.json(deliveries)
    } catch(error) {
        res.status(500).json({message: error.message})
    }
})

router.get("/stage/:status", async (req, res) => {
    const status = req.params.status
    try {
        const deliveries = await Delivery.find({ "status": status})
        res.json(deliveries)
    } catch(error) {
        res.status(500).json({message: error.message})
    }
})

router.get("/deliveryman/:userAddress", async (req, res) => {
    const deliveryMan = req.params.userAddress
    try {
        const deliveries = await Delivery.find({"deliveryMan": deliveryMan, "status": 1})
        res.json(deliveries)
    } catch(error) {
        res.status(500).json({message: error.message})
    }
})


router.post('/', async (req, res) => {
    const delivery = new Delivery({
        _id: req.body.requestId,
        to: req.body.to, 
        from: req.body.from, 
        item: req.body.item, 
        payment: req.body.payment, 
        status: req.body.status, 
        customer: req.body.customer, 
    })
    try {
        let newDelivery = await delivery.save()
        res.status(201).json(newDelivery)
    } catch(error) {
        res.status(400).json({message: error.message})
    }
})

router.patch('/:id', getDelivery, async (req, res) => {
    if (req.body.status != null) {
        res.delivery.status = req.body.status
    }
    if (req.body.deliveryMan != null) {
        res.delivery.deliveryMan = req.body.deliveryMan
    }
    try {
        const updatedDelivery = await res.delivery.save()
        res.json(updatedDelivery)
    } catch(error) {
        res.status(400).json({message: error.message})

    }
})

router.delete('/:id', getDelivery, async (req, res) => {
    try {
        await res.delivery.remove()
        res.json({message: "Deleted delivery"})
    } catch(error) {
        res.status(500).json({message: error.message})
    }
})


async function getDelivery(req, res, next) {
    let delivery
    try {
        delivery = await Delivery.findById(req.params.id)
        if(delivery == null) {
            return res.status(404).json({message: "Cannot find delivery"})
        }
    } catch(error) {
        return res.status(500).json({message: error})
    }

    res.delivery = delivery
    next()
}

module.exports = router