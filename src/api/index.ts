import api from './request';

export const login = ({ id, captcha }: { id: string, captcha: string }) => {
  return api.post('/user/login', { id, captcha });
};

// 获取邮箱验证码
export const getEmailCaptcha = (email: string) => {
  return api.post('/email/captcha', { email });
}