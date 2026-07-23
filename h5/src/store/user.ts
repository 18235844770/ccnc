import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { UserInfo } from "./interface/userInterface";

const defaultUserInfo: UserInfo = {
	id: "",
	username: "",
	name: "",
	avatar: "",
	phone: "",
	email: "",
	status: "",
};

export const useUserStore = defineStore(
	"user",
	() => {
		const token = ref("");
		const userInfo = ref<UserInfo>({ ...defaultUserInfo });
		const isLogin = ref(false);

		/** 是否已登录 */
		const loggedIn = computed(() => !!token.value && isLogin.value);

		/** 设置登录态 */
		function setLogin(t: string, user: Partial<UserInfo>) {
			token.value = t;
			userInfo.value = { ...defaultUserInfo, ...user };
			isLogin.value = true;
		}

		/** 退出登录 */
		function logout() {
			token.value = "";
			userInfo.value = { ...defaultUserInfo };
			isLogin.value = false;
		}

		/** 检查是否已登录 */
		function checkLogin(): boolean {
			return !!token.value && isLogin.value;
		}

		return {
			token,
			userInfo,
			isLogin,
			loggedIn,
			setLogin,
			logout,
			checkLogin,
		};
	},
	{
		unistorage: {
			key: "user", // 在缓存里面 key 值
			storage: localStorage,
			paths: ["token", "userInfo", "isLogin"], // 需要缓存哪些变量
		},
	}
);
