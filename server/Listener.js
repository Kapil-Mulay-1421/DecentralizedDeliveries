require('dotenv').config()
const Web3 = require('web3')
const url = "wss://ropsten.infura.io/ws/v3/e626baf19e274ccdb4398af533a0ff91"
const web3 = new Web3(url)
const axios = require('axios')

function listen(address, api_endpoint, callback) {

    const contractAddress = address
    const serverUrl = api_endpoint

    const optionsRequest = {
        address: contractAddress,
        topics: ["0x2d71d9aad14d1b4a2b371a75933d3ce993654b7553f2174187fd3656b6cd249d"]
    }
    const optionsAccept = {
        address: contractAddress,
        topics: ["0xec757d6649dc828f48dd20f5482a10efbdbef8988c5448f2a9427ea1e77540f2"]
    }
    const optionsAllege = {
        address: contractAddress,
        topics: ["0x5cbe1f7a3b903b0146d856b3d729a91dbc5a8883cbebf4a14d86ec2927e46efb"]
    }
    const optionsConfirm = {
        address: contractAddress,
        topics: ["0xab1dc58794775a216f512a1d5f2b49cf3f0cafc0dc1457da704dafa0935f12d3"]
    }

    let subscriptionIds = []
    function checkInitialized() {
        console.log(subscriptionIds)
        if (subscriptionIds.length == 4) {
            callback()
        }
    }

    var requestEventSubscription = web3.eth.subscribe('logs', optionsRequest, function(error, result){
        if (!error){
            console.log('got result');
        } else {
            console.log(error)
        }
    })
    .on("connected", function(subscriptionId){
        subscriptionIds.push(subscriptionId);
        checkInitialized()
    })
    .on("data", function(log){
        console.log("Got Data")
        const params = decodeRequestLog(log)
        const deliveryObj = {
            requestId: params.requestId,
            to: params.to, 
            from: params.from, 
            item: params.item, 
            payment: params.payment, 
            status: "0", 
            customer: params.customer
        }
        axios.post(serverUrl, deliveryObj)
        .then(res => {
            console.log(res.data)
        })
        .catch(error => {
            console.log(error)
        }) 
    })
    .on("changed", function(log){
    });

    var acceptEventSubscription = web3.eth.subscribe('logs', optionsAccept, function(error, result){
        if (!error)
            console.log('got result');
    })
    .on("connected", function(subscriptionId){
        subscriptionIds.push(subscriptionId);
        checkInitialized()
    })
    .on("data", function(log){
        console.log("Got data")
        const params = decodeAcceptLog(log)
        const path = serverUrl+"/"+params.requestId
        const bodyObj = {
            status: "1",
            deliveryMan: params.deliveryMan
        }
        axios.patch(path, bodyObj)
        .then(res => {
        console.log(res.data)
        })
        .catch(error => {
            console.log(error)
        }) 
    });

    var allegeEventSubscription = web3.eth.subscribe('logs', optionsAllege, function(error, result){
        if (!error)
            console.log('got result');
    })
    .on("connected", function(subscriptionId){
        subscriptionIds.push(subscriptionId);
        checkInitialized()
    })
    .on("data", function(log){
        const params = decodeAllegeLog(log)
        const path = serverUrl+"/"+params.requestId
        const bodyObj = {
            status: "2",
        }
        axios.patch(path, bodyObj)
        .then(res => {
            console.log(res.data)
        })
        .catch(error => {
            console.log(error)
        }) 
    });

    var confirmEventSubscription = web3.eth.subscribe('logs', optionsConfirm, function(error, result){
        if (!error)
            console.log('got result');
    })
    .on("connected", function(subscriptionId){
        subscriptionIds.push(subscriptionId);
        checkInitialized()
    })
    .on("data", function(log){
        const params = decodeConfirmLog(log)
        const path = serverUrl+"/"+params.requestId
        const bodyObj = {
            status: "3",
        }
            axios.patch(path, bodyObj)
        .then(res => {
            console.log(res.data)
        })
        .catch(error => {
            console.log(error)
        }) 
    });


    function decodeRequestLog(log) {
        let decoded = web3.eth.abi.decodeParameters([{
            type: 'string', 
            name: 'to'
        },
        {
            type: 'string',
            name: 'from'

        }, {
            type: 'string', 
            name: 'item', 
            indexed: true
        }, {
            type: 'uint256', 
            name: 'payment', 
            indexed: true
        }, {
            type: 'bytes32', 
            name: 'requestId', 
            indexed: true
        }, {
            type: 'address', 
            name: 'customer'
        }], log.data
        )
        return decoded;
    }

    function decodeAcceptLog(log) {
        let decoded = web3.eth.abi.decodeParameters([{
            type: 'bytes32', 
            name: 'requestId'
        },
        {
            type: 'address',
            name: 'deliveryMan'

        }], log.data
        )
        return decoded;
    }

    function decodeAllegeLog(log) {
        let decoded = web3.eth.abi.decodeParameters([{
            type: 'bytes32', 
            name: 'requestId'
        }], log.data
        )
        return decoded;
    }

    function decodeConfirmLog(log) {
        let decoded = web3.eth.abi.decodeParameters([{
            type: 'bytes32', 
            name: 'requestId'
        }], log.data
        )
        return decoded;
    }
}


module.exports.listen = listen