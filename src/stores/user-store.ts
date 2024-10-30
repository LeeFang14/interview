import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { User } from '../types/user';

export const useUserStore = defineStore('user', () => {
  const userList = ref<User[]>([]);

  async function createUser(userData: User): Promise<number | null> {
    try {
      const response = await api.post('/', userData);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function fetchUserList(): Promise<number | null> {
    try {
      const response = await api.get('/a');
      userList.value = response.data;
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function updateUser(userData: User): Promise<number | null> {
    try {
      const response = await api.patch('/', userData);
      return response.status;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function deleteUser(userID: number): Promise<number | null> {
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
