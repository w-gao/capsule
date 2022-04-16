import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {CapsuleProvider} from "./contexts/CapsuleContext";
import HomeView from './views/Home.view'

ReactDOM.render(
  <React.StrictMode>
      <CapsuleProvider baseUrl="ws://localhost:5000">
      <HomeView />
      </CapsuleProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
