import api from './request';


/**
 * 启动 L1 BP 材料撰写
 * @param data 
 * @returns 
 */
export const startMaterialsGeneration = (id: string) => {
  return api.post('/lawcase/start', { id });
}

export const uploadCaseFile = (data: FormData) => {
  return api.post('/resource/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export const getCaseDetail = (lawcase_id: string) => {
  return api.get(`/resource/list`, { params: { lawcase_id } });
}

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