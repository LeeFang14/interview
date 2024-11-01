import { boot } from 'quasar/wrappers';
import axios from 'axios';

const axiosWrapper = axios.create({
  baseURL: 'https://dahua.metcfire.com.tw/api/CRUDTest',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosWrapper.interceptors.request.use(
  (config) => {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosWrapper.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('token 無效');
          console.log(error.message);
          break;
        case 404:
          alert('頁面不存在');
          console.log(error.message);
          break;
        case 500:
          alert('程式發生問題');
          console.log(error.message);
          break;
        default:
          alert('程式發生問題');
          console.log(error.message);
      }
    }
    if (!window.navigator.onLine) {
      alert('請重新連線後重整網頁');
    }
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = axiosWrapper;
});

export { axiosWrapper as api };
