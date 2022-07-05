// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DeliveryHandler {

  enum DeliveryStage{ Requested, Accepted, Alleged, Completed }

  struct DeliveryRequest {
    string _to;
    string _from;
    string _item;
    uint256 _payment;
    DeliveryStage status;
    address _customer;
    address _deliveryMan;
  }

  mapping(address => bool) blacklist;
  mapping(bytes32 => DeliveryRequest) public deliveries; 

  event RequestEvent( string to, string from, string item, uint256 payment, bytes32 requestId, address customer);
  event AcceptEvent(bytes32 requestId, address deliveryMan);
  event AllegeEvent(bytes32 requestId);
  event CompleteEvent(bytes32 requestId);

  function keccakHash(DeliveryRequest memory _request) internal view returns(bytes32 requestId) {
    requestId = bytes32(keccak256(abi.encode(msg.sender, blockhash(block.number - 1), _request)));
    while (deliveries[requestId]._payment != 0) {
      requestId = bytes32(keccak256(abi.encode(requestId)));
    }
    return requestId;
  }

  function requestDelivery(string memory _to, string memory _from, string memory _item) public payable {
    uint256 payment = msg.value;
    address customer = msg.sender;
    require(payment > 0, "Please attach some deposit as payment for the delivery.");
    address deliveryMan;
    DeliveryRequest memory request = DeliveryRequest(_to, _from, _item, payment, DeliveryStage.Requested, customer, deliveryMan);
    bytes32 requestId = keccakHash(request);
    deliveries[requestId] = request;
    emit RequestEvent(_to, _from, _item, payment, requestId, customer);
  }

  function acceptDelivery(bytes32 _requestId) public {
    address deliveryMan = msg.sender;
    require(deliveries[_requestId]._payment != 0, "This delivery request does not exist.");
    require(deliveries[_requestId].status == DeliveryStage.Requested, "This delivery request has already been accepted.");
    require(! blacklist[deliveryMan], "You have been blacklisted. Cannot proceed.");
    deliveries[_requestId].status = DeliveryStage.Accepted;
    deliveries[_requestId]._deliveryMan = deliveryMan;
    emit AcceptEvent(_requestId, deliveryMan);
  }

  function allegeDelivery(bytes32 _requestId) public {
    require(msg.sender == deliveries[_requestId]._deliveryMan, "Delivery Man and Request did not match.");
    deliveries[_requestId].status = DeliveryStage.Alleged;
    emit AllegeEvent(_requestId);
  }

  function confirm(bytes32 _requestId) public {
    require(deliveries[_requestId].status == DeliveryStage.Alleged, "The delivery isn't alleged.");
    require(msg.sender == deliveries[_requestId]._customer, "You are not the one who initiated the request.");
    payable(deliveries[_requestId]._deliveryMan).transfer(deliveries[_requestId]._payment);
    deliveries[_requestId].status = DeliveryStage.Completed;
    emit CompleteEvent(_requestId);
  }
}