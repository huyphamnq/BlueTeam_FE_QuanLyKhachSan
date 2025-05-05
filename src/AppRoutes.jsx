import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App'; // Trang đăng nhập
import TrangChu from './trangchu'; // Trang chủ sau khi đăng nhập thành công
import PrivateRoute from './PrivateRoute'; // Import PrivateRoute

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} /> {/* Trang đăng nhập */}
      
      {/* Bảo vệ trang chủ, chỉ cho phép truy cập nếu đã đăng nhập */}
      <Route path="/trangchu" element={<PrivateRoute element={<TrangChu />} />} />
    </Routes>
  );
}

export default AppRoutes;
