import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '../boot/axios';

export const useUserStore = defineStore('user', () => {
  const userList = ref([]);

  async function createUser(userData) {
    try {
      const response = await api.post('/', userData);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function fetchUserList() {
    try {
      const response = await api.get('/a');
      userList.value = response.data;
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function updateUser(userData) {
    try {
      const response = await api.patch('/', userData);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function deleteUser(userID) {
    try {
      const response = await api.delete(`/${userID}`);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  return {
    userList,
    createUser,
    fetchUserList,
    updateUser,
    deleteUser,
  };
});
