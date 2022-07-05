import React, {useRef, useState} from 'react'
import useEth from "../contexts/EthContext/useEth";
import Axios from 'axios'
import '../App.css'
require('dotenv').config()


const serverUrl = "http://localhost:3000" + '/deliveries/'
let userAddress = null;

const AcceptDelivery = () => {
  
    const { state: { contract, accounts } } = useEth()
    const [deliveryRequests, setDeliveryRequests] = useState([])
    if(accounts != null) {
      userAddress = accounts[0]
    }

    if(userAddress != null) {
      Axios.get(serverUrl+'stage/0').then(response => {
        setDeliveryRequests(response.data)
      })
    }

    const acceptDelivery = async (index) => {
      const hash = deliveryRequests[index]._id
      if(hash === '') {
        alert('There was a problem, please try again.');
        return;
      }
      try {
        await contract.methods.acceptDelivery(hash).send({from: accounts[0]}).then((response) => {
          console.log(response)
          alert("Accepted request. Head over to the Proclaims page once you make the delivery.")
        })
      } catch(err) {
        alert(err)
      }
    }

  return (
    <div id='wrapper'>
        <h2>Make a Delivery</h2>
        <table id='deliveries'>
          <tr>
            <th>Index</th>
            <th>Item</th>
            <th>Pickup From</th>
            <th>Deliver To</th>
            <th>Reward(in wei)</th>
            <th>Accept Delivery</th>
          </tr>
          {deliveryRequests != null ? deliveryRequests.map((req, index) =>  {
            return (
              <tr>
                <td>{index+1}</td>
                <td>{req.item}</td>
                <td>{req.from}</td>
                <td>{req.to}</td>
                <td>{req.payment}</td>
                <td><button onClick={() => acceptDelivery(index)}>Accept</button></td>
              </tr>
            )
          }): console.log("deliveryRequests was null.")}
        </table>
        {deliveryRequests != null ? deliveryRequests.length == 0 ? "No delivery requests yet." : null : null}
    </div>
  )
}

export default AcceptDelivery