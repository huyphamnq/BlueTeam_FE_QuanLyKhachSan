import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Input, Space, Checkbox, message } from 'antd';
import './assets/css/base.css';
import './assets/css/Login.css';
import './assets/css/responsive.css';
import App from './App';
import image from './assets/andraes-arteaga-7FweK4uGEX4-unsplash.jpg';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Tự động điền username & password nếu đã lưu
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberUsername');
    const savedPassword = localStorage.getItem('rememberPassword');

    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      message.error('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    const payload = {
      UserName: username,
      Password: password,
    };

    try {
      const response = await fetch('https://quanlykhachsan-ozv3.onrender.com/api/Login/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // message.success('Đăng nhập thành công');
        localStorage.setItem('token', data.token);

        if (rememberMe) {
          localStorage.setItem('rememberUsername', username);
          localStorage.setItem('rememberPassword', password);
        } else {
          localStorage.removeItem('rememberUsername');
          localStorage.removeItem('rememberPassword');
        }

        navigate('/app');
      } else {
        message.error(data.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      message.error('Sai tài khoản hoặc mật khẩu!');
    }
  };

  const onChange = (e) => {
    setRememberMe(e.target.checked);
  };

  return (
    <>
      <div className="container">
        <div className="content">
          <div className="auth-container">
            <div className="form-login">
              <h1>Đăng nhập</h1>
              <h2>Chào mừng bạn đến với Hotel Management. Website quản lý khách sạn dễ dàng, hiệu quả và thông minh.</h2>

              <div className="mt-20">
                <h3 className="input-username-title">Tên đăng nhập</h3>
                <Input 
                  className="input-username" 
                  placeholder="VD: user123" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="mt-20">
                <h3 className="input-pass-title">Mật khẩu</h3>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input.Password 
                    className="input-pass"
                    placeholder="********"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Space>
              </div>

              <Button 
                type="primary" 
                className="btn mt-20" 
                id="btn-login" 
                onClick={handleLogin}
              >
                Đăng nhập
              </Button>

              <div className="auth-link">
                <Checkbox checked={rememberMe} onChange={onChange}>Nhớ mật khẩu</Checkbox>
                <a href="#" className="forget-pass">Quên mật khẩu?</a>
              </div>

              <div className="signup-link">
                <p>Bạn chưa có tài khoản? <a>Đăng ký ngay</a></p>
              </div>
            </div>
          </div>

          <section className="section">
            <img src={image} alt="hotel" />
          </section>
        </div>
      </div>
    </>
  );
}

export default Login;
