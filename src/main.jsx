import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';                // <- the only stylesheet we need

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
