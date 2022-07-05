const DeliveryHandler = artifacts.require("DeliveryHandler");

module.exports = function (deployer) {
  deployer.deploy(DeliveryHandler);
};
