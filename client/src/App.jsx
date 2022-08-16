import { EthProvider } from "./contexts/EthContext";
import "./App.css";
import AcceptDelivery from "./components/AcceptDelivery";
import RequestDelivery from "./components/RequestDelivery";
import ProclaimDelivery from "./components/ProclaimDelivery";
import {useState} from "react";
require('dotenv').config()


function App() {
  const domain = "http://localhost:3000"
  let location  = window.location.href
  const [request, changeRequest] = useState(location.slice(domain.length, location.length).toLowerCase())
  const [mining, setMining] = useState(false)

  function getComponent(request) {
    if (request === '/') {
      changeRequest("/#/")
    }
    if (request === '/#/') {
      return <RequestDelivery setMining={setMining} />
    }
    if (request === '/#/acceptdelivery') {
      return <AcceptDelivery setMining={setMining} />
    }
    if (request === '/#/proclaimdelivery') {
      return <ProclaimDelivery setMining={setMining} />
    }
  }

  return (
      <EthProvider>
      <div id="App" style={{position: "relative"}}>
        <div id="shadowLayer" className={mining?"is-visible":""}></div>
        <div className="topnav" style={{position: "absolute", zIndex: "2", width: "100%"}}>
          <a href="/#/" onClick={() => changeRequest("/#/")}>Home</a>
          <a href="/#/acceptdelivery" onClick={() => changeRequest("/#/acceptdelivery")}>Accept Delivery</a>
          <a href="/#/proclaimdelivery" onClick={() => changeRequest("/#/proclaimdelivery")}>Proclaims</a>
          <a href="">About</a>
        </div>
          <div className="container">
                {getComponent(request)}
          </div>
        </div>
      </EthProvider>
  );
}



export default App;
