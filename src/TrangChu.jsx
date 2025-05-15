import React from 'react';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaUsers, FaCloud, FaFileInvoice, FaHotel } from "react-icons/fa";
import { IoLogOutSharp } from "react-icons/io5";
import './TrangChu.css'

const { Header, Content, Footer, Sider } = Layout;

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
  { icon: FaHome, label: 'Trang chủ' },
  { icon: FaHotel, label: 'Phòng' },
  { icon: FaUser, label: 'Khách hàng' },
  { icon: FaUsers, label: 'Nhân Viên' },
  { icon: FaCloud , label: 'Dịch vụ' },
  { icon: FaFileInvoice , label: 'Hoá đơn' },
  { icon: IoLogOutSharp , label: 'Đăng xuất' },
];

const items = menuItems.map((item, index) => ({
  key: String(index + 1),
  icon: React.createElement(item.icon),
  label: item.label,
}));

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const handleMenuClick = ({ key }) => {
  if (key === '7') {
    localStorage.removeItem('token');
    navigate('/');
  }
};

  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{backgroundColor: '#fff'}}>
        <Content style={{ padding: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <p>long content</p>
            {
              // indicates very long content
              Array.from({ length: 100 }, (_, index) => (
                <React.Fragment key={index}>
                  {index % 20 === 0 && index ? 'more' : '...'}
                  <br />
                </React.Fragment>
              ))
            }
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;