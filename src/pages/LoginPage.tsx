import React, { useEffect, useRef, useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, getEmailCaptcha } from '../api';

const { Title } = Typography;

interface LoginFormData {
  email: string;
  captcha: string;
}

const LoginPage: React.FC<{ loginAction: (token: string, userInfo: string) => void }> = ({ loginAction }) => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      //登录api调用
      const res = await login({ id: values.email, captcha: values.captcha }) as any;
      if (res.code === 200) {
        message.success('登录成功！');
        // 存储登录状态
        const { token, email, username, id, role } = res.data
        loginAction(token, JSON.stringify({
          name: username,
          email,
          id,
          role
        }));
        navigate('/');
      } else {
        message.error(res.msg || '邮箱或验证码错误！');
      }
    } catch (error) {
      message.error('登录失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGetCaptcha = async () => {
    try {
      await form.validateFields(['email']);
      const email = form.getFieldValue('email');
      setSending(true);
      const res = await getEmailCaptcha(email) as any;
      if (res?.code === 200) {
        message.success('验证码已发送，请查收邮箱');
        startCountdown(60);
      } else {
        message.error(res?.msg || '发送验证码失败，请稍后重试');
      }
    } catch (error) {
      // 表单校验失败或请求异常
      if ((error as any)?.errorFields) {
        // 已由表单错误提示
        message.error((error as any)?.errorFields[0]?.errors[0]);
      } else {
        message.error('发送验证码失败，请稍后重试');
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 50%, #fff5ee 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
        styles={{ body: { padding: '40px' } }}
      >
        {/* Logo和标题区域 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <img
              src="/vite.svg"
              alt="logo"
              style={{
                width: '40px',
                height: '40px',
                filter: 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))'
              }}
            />
            <Title
              level={2}
              style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '28px',
                fontWeight: 600
              }}
            >
              L1 BP
            </Title>
          </div>
        </div>

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱格式！' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="请输入邮箱"
              size="large"
              style={{
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item
            name="captcha"
            rules={[
              { required: true, message: '请输入验证码！' },
              { pattern: /^\d{6}$/, message: '验证码为6位数字！' }
            ]}
            style={{ marginBottom: '32px' }}
          >
            <Input
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="请输入邮箱验证码"
              size="large"
              suffix={
                <Button
                  type="link"
                  onClick={handleGetCaptcha}
                  disabled={sending || countdown > 0}
                  style={{ padding: 0 }}
                >
                  {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
                </Button>
              }
              style={{
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '0' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              icon={<LoginOutlined />}
              style={{
                height: '50px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 500,
                background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;