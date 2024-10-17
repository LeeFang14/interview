// pinia
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { API } from '../boot/axios';

export const useUserStore = defineStore('user', () => {
  const user = ref({});
  const userList = ref([]);

  // 創建用戶
  async function createUser(userData) {
    try {
      const response = await API.post('/', userData);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 獲取用戶列表
  async function fetchUserList() {
    try {
      const response = await API.get('/a');
      userList.value = response.data;
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 獲取單個用戶
  async function fetchUser(userID) {
    try {
      const response = await API.get(`/${userID}`);
      user.value = response.data;
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 更新用戶
  async function updateUser(userID, userData) {
    try {
      const response = await API.patch(`/${userID}`, userData);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 刪除用戶
  async function deleteUser(userID) {
    try {
      const response = await API.delete(`/${userID}`);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  return {
    user,
    userList,
    createUser,
    fetchUserList,
    fetchUser,
    updateUser,
    deleteUser,
  };
});
