import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login'
import App from './App'
import PrivateRoute from './PrivateRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route path="/app/*" element={<PrivateRoute element={<App />} />} />
      
    </Routes>
  );
}


export default AppRoutes;
