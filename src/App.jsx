import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { FaUser, FaUsers, FaCloud, FaFileInvoice, FaHotel} from "react-icons/fa";
import { MdHotel, MdDashboard } from "react-icons/md";
import { IoLogOutSharp } from "react-icons/io5";
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import BangDieuKhien from './components/BangDieuKhien';
import Phong from './components/Phong';
import DatPhong from './components/DatPhong'
import KhachHang from './components/KhachHang';
import NhanVien from './components/NhanVien';
import DichVu from './components/DichVu';
import HoaDon from './components/HoaDon';

import './assets/css/App.css'

const { Sider, Content, Footer } = Layout;

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
  backgroundColor: '#fff',
};

const menuItems = [
  { icon: MdDashboard, label: 'Bảng điều khiển', path: '/app/bangdieukhien' },
  { icon: MdHotel, label: 'Đặt Phòng', path: '/app/datphong' },
  { icon: FaUser, label: 'Khách hàng', path: '/app/khachhang' },
  { icon: FaUsers, label: 'Nhân Viên', path: '/app/nhanvien' },
  { icon: FaHotel, label: 'Phòng', path: '/app/phong' },
  { icon: FaCloud, label: 'Dịch vụ', path: '/app/dichvu' },
  { icon: FaFileInvoice, label: 'Hoá đơn', path: '/app/hoadon' },
  { icon: IoLogOutSharp, label: 'Đăng xuất', path: '/' },
];

// Map thành items cho antd Menu
const items = menuItems.map((item, index) => ({
  key: String(index + 1),
  icon: React.createElement(item.icon),
  label: item.label,
}));

// Component chính chứa Layout và Menu
const AppLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  // Tìm key menu đang chọn dựa theo url path
  const selectedKey = React.useMemo(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    return index !== -1 ? String(index + 1) : '1';
  }, [location.pathname]);

  const handleMenuClick = ({ key }) => {
    if (key === '7') {
      localStorage.removeItem('token');
      navigate('/');
    } else {
      const path = menuItems[Number(key) - 1].path;
      navigate(path);
    }
  };

  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ backgroundColor: '#fff', padding: 24 }}>
        <Content style={{overflow: 'initial' }}>
          <div
            style={{
              minHeight: '80vh',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="bangdieukhhien" element={<BangDieuKhien />} />
              <Route path="phong" element={<Phong />} />
              <Route path="datphong" element={<DatPhong />} />
              <Route path="khachhang" element={<KhachHang />} />
              <Route path="nhanvien" element={<NhanVien />} />
              <Route path="dichvu" element={<DichVu />} />
              <Route path="hoadon" element={<HoaDon />} />
              <Route path="*" element={<BangDieuKhien />} />
            </Routes>
          </div>
        </Content>
        {/* <Footer style={{ textAlign: 'center', backgroundColor: '#212121', height: 40 }}>
          QLKS ©{new Date().getFullYear()} Created by BlueTeam
        </Footer> */}
      </Layout>
    </Layout>
  );
};

const App = () => <AppLayout />;

export default App;
