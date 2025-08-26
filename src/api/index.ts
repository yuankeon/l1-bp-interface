import api from './request';

export const getCaseList = () => {
  return api.get('/lawcase/list');
};

export interface AddCaseParams {
  name: string;
  type: string;
  remark?: string;
  vars?: string;
}

export const addCase = (data: AddCaseParams) => {
  return api.post('/lawcase/create', data);
};

export const login = ({ id, captcha }: { id: string, captcha: string }) => {
  return api.post('/user/login', { id, captcha });
};

// 获取邮箱验证码
export const getEmailCaptcha = (email: string) => {
  return api.post('/email/captcha', { email });
}