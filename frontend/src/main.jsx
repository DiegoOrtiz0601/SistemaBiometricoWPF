import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { routerConfig } from './router/config'

const router = createBrowserRouter(
  [
    {
      path: "*",
      element: <App />,
    }
  ],
  routerConfig
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} future={routerConfig.future} />
  </React.StrictMode>,
)
