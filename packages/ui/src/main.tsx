import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {CapsuleProvider} from "./contexts/CapsuleContext";
import HomeView from './views/Home.view'

//       <CapsuleProvider baseUrl="wss://la-hacks-2022-capsule.wl.r.appspot.com">

ReactDOM.render(
  <React.StrictMode>
      <CapsuleProvider baseUrl="ws://localhost:5000">
      <HomeView />
      </CapsuleProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
