import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import './TrangChu.css';

const { Sider, Content } = Layout;

function TrangChu() {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('1');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
  }, [navigate]);

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <h2>Quản lý khách hàng</h2>;
      case '2':
        return <h2>Quản lý nhân viên</h2>;
      case '3':
        return <h2>Quản lý phòng</h2>;
      case '4':
        return <h2>Dịch vụ</h2>;
      case '5':
        return <h2>Hóa đơn</h2>;
      default:
        return <h2>Chào mừng bạn đến với Website Quản lý khách sạn!</h2>;
    }
  };

  return (
    <Layout className="layout">
      <Sider width={280} className="sider">
        <div className="logo">//LOGO//</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
        >
          <Menu.Item key="1" icon={<UserOutlined />}>
            Khách hàng
          </Menu.Item>
          <Menu.Item key="2" icon={<TeamOutlined />}>
            Nhân viên
          </Menu.Item>
          <Menu.Item key="3" icon={<HomeOutlined />}>
            Phòng
          </Menu.Item>
          <Menu.Item key="4" icon={<AppstoreOutlined />}>
            Dịch vụ
          </Menu.Item>
          <Menu.Item key="5" icon={<FileTextOutlined />}>
            Hóa đơn
          </Menu.Item>
        </Menu>

        <div className="logout-btn">
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            danger
            block
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      <Layout className="main-layout">
        <Content className="content-area">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default TrangChu;
