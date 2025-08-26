import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown } from 'antd';
import {
  FileZipOutlined,
  UserOutlined,
  LogoutOutlined,
  FilePptOutlined,
} from '@ant-design/icons';

// 导入页面组件
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PromptPage from './pages/PromptPage';

const { Sider, Content } = Layout;
const { Title } = Typography;

// 菜单配置
const menuItems = [
  {
    key: '/',
    icon: <FileZipOutlined />,
    label: '案件管理',
  },
  {
    key: '/prompt',
    icon: <FilePptOutlined />,
    label: 'Prompt',
  }
];


interface UserInfo {
  name: string;
  email: string;
  id: string;
  role: 'admin' | 'user';
}

export const useAuth = () => {
  const [isLogin, setIsLogin] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const login = (token: string, userInfo: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', userInfo);
    setIsLogin(true);
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsLogin(false);
  };
  return { isLogin, login, logout, userInfo };
};


const AppContent: React.FC<{ logout: () => void, userInfo: UserInfo }> = ({ logout, userInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 用户下拉菜单
  const userDropdownItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={200}
        theme="dark"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 100,
        }}
      >
        <div style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}>
          <img src={'/vite.svg'} alt="logo" style={{ width: '24px', height: '24px' }} />
          <Title level={4} style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
            L1 BP
          </Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.startsWith('/facts') || location.pathname.startsWith('/zip-facts') ? '/facts' : location.pathname.startsWith('/zip-detail') ? '/zip-list' : location.pathname]}
          style={{
            borderRight: 0,
            marginTop: '8px',
            background: 'transparent',
            flex: 1,
          }}
          items={menuItems}
          onClick={handleMenuClick}
        />

        {/* 用户信息区域 */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <Dropdown
            menu={{ items: userDropdownItems }}
            placement="topLeft"
            trigger={['click']}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ backgroundColor: '#667eea' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userInfo?.name || '用户'}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userInfo?.email}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Content style={{
          background: '#f8f9fa',
          minHeight: '100vh',
          padding: '0',
          overflow: 'auto',
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/prompt" element={<PromptPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  const { isLogin, login, logout, userInfo } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage loginAction={login} />} />
        <Route
          path="*"
          element={
            isLogin ? (
              <AppContent logout={logout} userInfo={userInfo} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
