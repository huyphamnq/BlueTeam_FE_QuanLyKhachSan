import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token"); // Kiểm tra token trong localStorage

  if (!token) {
    // Nếu không có token, chuyển hướng về trang đăng nhập
    return <Navigate to="/" />;
  }

  return element; // Nếu có token, cho phép truy cập vào trang
};

export default PrivateRoute;
