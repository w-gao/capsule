import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {CapsuleProvider} from "./contexts/CapsuleContext";
import HomeView from './views/Home.view'


ReactDOM.render(
  <React.StrictMode>
      <CapsuleProvider baseUrl="wss://la-hacks-2022-capsule.wl.r.appspot.com">
      <HomeView />
      </CapsuleProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
