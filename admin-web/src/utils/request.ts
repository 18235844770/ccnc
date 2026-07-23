import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import type { ApiResponse } from '@ccnc/shared';

export type { ApiResponse };

// 扩展 AxiosRequestConfig 以支持自定义属性（可选）
interface CustomRequestConfig extends AxiosRequestConfig {
  // 是否隐藏错误提示，默认 false
  hideErrorMsg?: boolean;
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api/v1', // 从环境变量获取
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 或 Pinia Store 获取 token
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      // 对应文档: Authentication: Bearer Token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { status, data } = response;
    
    // HTTP 200 但业务状态可能是 error (虽然您的后端倾向于使用 HTTP 4xx/5xx 表示错误，但也可能返回 200 + status: "error")
    if (status === 200) {
        // 如果后端在 200 OK 下也返回 status: "error"
        if (data.status === 'error') {
            Message.error(data.message || 'Error');
            return Promise.reject(new Error(data.message || 'Error'));
        }
        return response; // 返回完整响应，以便组件层获取 data 或 message
    }
    
    return response;
  },
  (error: any) => {
    const { response } = error;
    let message = '请求失败';

    if (response) {
      // 后端返回了响应，但状态码超出了 2xx 范围
      const resData = response.data as ApiResponse;
      message = resData.message || getHttpStatusMessage(response.status);

      // 处理特定状态码
      switch (response.status) {
        case 401:
          // Token 过期或无效
          handleUnauthorized();
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          break;
      }
    } else if (error.message.includes('timeout')) {
      message = '请求超时';
    } else if (error.message.includes('Network Error')) {
      message = '网络连接错误';
    }

    // 弹出错误提示
    Message.error(message);
    
    return Promise.reject(error);
  }
);

// 辅助函数：处理 401 未授权
function handleUnauthorized() {
  Modal.warning({
    title: '系统提示',
    content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
    okText: '重新登录',
    cancelText: '取消',
    onOk: () => {
      localStorage.removeItem('token'); // 清除 token
      location.reload(); // 或者跳转到登录页 router.push('/login')
    }
  });
}

// 辅助函数：状态码文案
function getHttpStatusMessage(status: number): string {
  const statusMap: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请登录',
    403: '拒绝访问',
    404: '请求地址出错',
    408: '请求超时',
    500: '服务器内部错误',
    501: '服务未实现',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
    505: 'HTTP版本不受支持',
  };
  return statusMap[status] || '系统未知错误';
}

/**
 * 封装常用请求方法
 * T: 响应数据 data 的类型
 * D: 请求参数 payload 的类型
 */
const request = {
  get<T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<ApiResponse<T>> {
    return service.get(url, { ...config, params }).then(res => res.data);
  },

  post<T = any, D = any>(url: string, data?: D, config?: CustomRequestConfig): Promise<ApiResponse<T>> {
    return service.post(url, data, config).then(res => res.data);
  },

  put<T = any, D = any>(url: string, data?: D, config?: CustomRequestConfig): Promise<ApiResponse<T>> {
    return service.put(url, data, config).then(res => res.data);
  },

  delete<T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<ApiResponse<T>> {
    return service.delete(url, { ...config, params }).then(res => res.data);
  },
  
  // 暴露原始 axios 实例
  instance: service
};

export default request;