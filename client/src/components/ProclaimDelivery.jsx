import React, {useState} from 'react'
import useEth from "../contexts/EthContext/useEth";
import Axios from 'axios'
import '../App.css'
require('dotenv').config()


const serverUrl = "http://localhost:3000" + '/deliveries/'
let userAddress = null;
let listeningToCompleteEvent = false;

const ProclaimDelivery = () => {
  
    const { state: { contract, accounts } } = useEth();
    const [deliveryRequests, setDeliveryRequests] = useState([])
    if(accounts != null) {
      userAddress = accounts[0]
    }

    if(userAddress != null) {
      Axios.get(serverUrl+'deliveryMan/' + userAddress).then(response => {
        setDeliveryRequests(response.data)
      })
    }

    const handleComplete = (log) => {
      let requestId = log.returnValues.requestId
      let tempRequests = deliveryRequests
      tempRequests.forEach((request, index) => {
        if (request._id == requestId) {
          alert("The Delivery has been confirmed. The reward has been transferred to your account.")
        }
      }) 
    }

    // starting listener for Confirmation Event.
    if (contract != null && !listeningToCompleteEvent) {
      window.completeEvent = contract.events.CompleteEvent()
      .on("data", function(log) {
        handleComplete(log);
      })
      listeningToCompleteEvent = true;
    }

    const proclaimDelivery = async (index) => {
      const hash = deliveryRequests[index]._id
      if(hash === '') {
        alert('There was some problem. Please try again.');
        return;
      }
      try {
        await contract.methods.allegeDelivery(hash).send({from: accounts[0]}).then((response) => {
          console.log(response)
          alert("Waiting for confirmation from customer. Money will be transferred to your account after confirmation.")
        })
      } catch(err) {
        alert(err)
      }
    }

  return (
    <div id='wrapper'>
        <h2>Proclaim your delivery</h2>
        <table id='deliveries'>
          <thead>
            <tr>
              <th>Index</th>
              <th>Item</th>
              <th>Pickup From</th>
              <th>Deliver To</th>
              <th>Reward</th>
              <th>Accept Delivery</th>
            </tr>
          </thead>
          <tbody>
          {deliveryRequests != null ? deliveryRequests.map((req, index) =>  {
            return (
              <tr>
                <td>{index+1}</td>
                <td>{req.item}</td>
                <td>{req.from}</td>
                <td>{req.to}</td>
                <td>{req.payment}</td>
                <td><button onClick={() => proclaimDelivery(index)}>Proclaim</button></td>
              </tr>
            )
          }): console.log("deliveryRequests was null.")}
          </tbody>
        </table>
        {deliveryRequests != null ? deliveryRequests.length == 0 ? "No delivery requests yet." : null : null}
    </div>
  )
}

export default ProclaimDelivery