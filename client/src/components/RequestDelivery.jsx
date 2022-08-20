import React, {useState, useEffect} from 'react'
import useEth from "../contexts/EthContext/useEth";
import Axios from 'axios'
import "../App.css"
require('dotenv').config()


const serverUrl = "http://localhost:3000" + '/deliveries/'
let userAddress = null;

let listeningToAllegeEvent = false;
let listeningToAcceptEvent = false;

const RequestDelivery = ({ setMining }) => {
  const { state: { contract, accounts } } = useEth();
  const [requests, setRequests] = useState([])

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  useEffect(() => {
    if(accounts != null) {
      userAddress = accounts[0]
    }
    if(userAddress != null) {
      Axios.get(serverUrl+'address/' + userAddress).then(response => {
        setRequests(response.data)
        setCookie("requests", JSON.stringify(response.data), 7)
      })
    }
  }, [contract])

  function getRequests() {
    Axios.get(serverUrl+'address/' + userAddress).then(response => {
      setRequests(response.data)
      setCookie("requests", JSON.stringify(response.data), 7)
    })
  }


  const [to, setTo] = useState(null)
  const [from, setFrom] = useState(null)
  const [item, setItem] = useState(null)
  const [value, setValue] = useState(0)
  window.allegeEvent = null;


  // starting listener for Accept Event.
  if (contract != null && !listeningToAcceptEvent) {
    window.acceptEvent = contract.events.AcceptEvent()
    .on("data", function(log) {
      handleAccept(log);
    })
    listeningToAcceptEvent = true;
  }

  // starting listener for Allege Event.
  if (contract != null && !listeningToAllegeEvent) {
    window.allegeEvent = contract.events.AllegeEvent()
    .on("data", function(log) {
      handleAllege(log);
    })
    listeningToAllegeEvent = true;
  }

  const handleInput = e => {
    switch(e.target.name) {
        case 'to': 
            setTo(e.target.value);
            break;
        case 'from':
            setFrom(e.target.value);
            break;
        case 'item': 
            setItem(e.target.value);
            break;
        case 'value': 
            setValue(e.target.value);
            break;
        default: 
            alert('Invalid input source.')
            break;
    }
  }

  const handleSubmit = async () => {
    // Validation: 
    if (to === null || from === null || item === null || value === 0) {
        alert("Please fill in all the values.")
        return;
    }

    // Calling Contract if validation succeeds: 
    // Showing shadowLayer:
    setMining(true)
    try {
      await contract.methods.requestDelivery(to, from, item).send({from: accounts[0], value: value}).then((response) => {
        getRequests()
        console.log(response)
      })
    } catch(err) {
      console.log(err)
    }
    setMining(false)
  }

  window.handleConfirm = async (index) => {
    let requestId = requests[index]._id
    setMining(true)
    try {
      await contract.methods.confirm(requestId).send({from: accounts[0]}).then((response) => {
        getRequests()
        console.log(response)
      })
    } catch(err) {
      console.log(err)
    }
    setMining(false)
  }

  const handleAccept = (log) => {
    let requestId = log.returnValues.requestId
    let tempRequests = JSON.parse(getCookie("requests"))
    tempRequests.forEach((request, index) => {
      if (request._id == requestId) {
        tempRequests[index].status = 1
        tempRequests[index].deliveryMan = log.returnValues.deliveryMan
        setRequests(tempRequests)
        return;
      }
    }) 
  }

  const handleAllege = (log) => {
    let requestId = log.returnValues.requestId
    let tempRequests = JSON.parse(getCookie("requests"))
    tempRequests.forEach((request, index) => {
      if (request._id == requestId) {
        tempRequests[index].status = 2
        setRequests(tempRequests)
        return;
      }
    }) 
  }

  return (
    <div style={{display: "flex", justifyContent: "space-between", height: "100vh", width: "100vw"}}>
    <div id='wrapper' style={{padding: "50px", height: "100vh", width: "50vw", overflow: "auto"}}>
      <h1>Welcome to Decentralized Deliveries</h1>
      <div className='align-center'>
        <h2 style={{marginTop: "50px"}}>Request a Delivery</h2>
        <div id='form-input-wrapper'>

          <div className='group'>
            <input type="text" name='item' onChange={handleInput} required />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label htmlFor="item">Pick this up: </label>
          </div>

          <div className='group'>
            <input type="text" name='to' onChange={handleInput} required />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label htmlFor="to">Delivery Destination: </label>
          </div>
      
          <div className='group'>
            <input type="text" name='from' onChange={handleInput} required />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label htmlFor="from">Pickup From: </label>
          </div>
    
          <div className='group'>
            <input type="number" name='value' onChange={handleInput} required />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label htmlFor="value">Attach payment(in wei): </label>
          </div>

        </div>
        <button style={{marginTop: "30px"}} onClick={handleSubmit}>Submit</button>
      </div>

      <div className='align-center'>
        <h2>Your Orders</h2>
        <table id='deliveries'>
          <thead>
            <tr>
              <th>Index</th>
              <th>Item</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests != null ? requests.map((request, index) => {
              return (
                <tr>
                  <td>{index+1}</td>
                  <td>{request.item}</td>
                  <td>{request.from}</td>
                  <td>{request.to}</td>
                  <td>{request.status == "0" ? "Requested" : request.status == '1' ? "on the way" : request.status == '2' ? <button onClick={() => window.handleConfirm(index)}>Confirm</button> : "Completed."}</td>
              </tr>
              )
            }): "You have not requestsed anything yet."}
          </tbody>
        </table>
      </div>
    </div>
    <div  style={{height: "100vh", width: "50vw", overflow: "hidden", position: 'relative'}}>
      <img src="../../homePageImg.jpg" alt="" style={{height: "100%", width: "auto"}} />
      <p className="credit">Photo by <a href="https://unsplash.com/@anniespratt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Annie Spratt</a> on <a href="https://unsplash.com/s/photos/basket?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></p>
    </div>
    </div>
  )
}

export default RequestDelivery