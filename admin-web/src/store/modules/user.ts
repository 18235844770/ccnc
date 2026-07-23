import { defineStore } from 'pinia';
import { login, getUserInfo, getMenusTree } from '@/api/auth';
import type { UserInfoData } from '@/types/system';

interface UserState {
  token: string;
  userInfo: UserInfoData['user'] | null;
  roles: string[];
  permissions: string[];
  menus: any[];
  routesLoaded: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    roles: [],
    permissions: [],
    menus: [],
    routesLoaded: false,
  }),
  actions: {
    async login(loginForm: { username: string; password: string }) {
      const res = await login(loginForm);
      const token = res.token;
      if (token) {
        this.token = token;
        localStorage.setItem('token', token);
      }
      if (res.data) {
        this.userInfo = res.data.admin as any;
        this.permissions = res.data.permissions || [];
        this.menus = res.data.menus || [];
        this.roles = ['admin'];
        this.routesLoaded = false;
      }
    },
    async fetchUserInfo() {
      const res = await getUserInfo();
      if (res.data) {
        this.userInfo = res.data.user;
        this.roles = res.data.roles;
        this.permissions = res.data.permissions;
      }
    },
    async fetchMenus() {
        const res = await getMenusTree();
        if (res.data) {
            this.menus = res.data;
        }
        return res.data;
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      this.roles = [];
      this.permissions = [];
      this.menus = [];
      this.routesLoaded = false;
      localStorage.removeItem('token');
    },
  },
});
