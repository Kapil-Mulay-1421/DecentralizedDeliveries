const DeliveryHandler = artifacts.require("DeliveryHandler");
const { expect } = require("chai");
let chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN);
chai.use(chaiBN);

chai.use(chaiAsPromised);

contract("Delivery Test", async accounts => {

    it("should be able to take delivery requests when deposit is attached", async () => {
        let instance = await DeliveryHandler.deployed();
        await expect(instance.requestDelivery("To Address", "From Address", "Item Name")).to.eventually.be.rejected;
        await expect(instance.requestDelivery("To Address", "From Address", "Item Name", {from : accounts[0], value: 1000000000000000})).to.eventually.be.fulfilled;
    })

    it("should allow requests to be accepted", async () => {
        let instance = await DeliveryHandler.deployed();
        let response = await instance.requestDelivery("To Address", "From Address", "Item Name", {from : accounts[0], value: 1000000000000000});
        let _requestId = response.logs[0].args.requestId;
        await expect(instance.acceptDelivery(_requestId, {from: accounts[1]})).to.eventually.be.fulfilled;
    })

    it("should not allow anyone but the registered deliveryman to allege the delivery", async () => {
        let instance = await DeliveryHandler.deployed();
        let response = await instance.requestDelivery("To Address", "From Address", "Item Name", {from : accounts[0], value: 1000000000000000});
        let _requestId = response.logs[0].args.requestId;
        instance.acceptDelivery(_requestId, {from: accounts[1]});
        await expect(instance.allegeDelivery(_requestId, {from: accounts[2]})).to.eventually.be.rejected;
        await expect(instance.allegeDelivery(_requestId, {from: accounts[1]})).to.eventually.be.fulfilled;
    })
})