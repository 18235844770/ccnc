export interface UserInfo {
	id: string;
	username?: string;
	name?: string;
	avatar?: string;
	phone?: string;
	phone_number?: string;
	email?: string;
	status?: string;
	created_at?: string;
}
export interface UserState {
	token: string;
	userInfo: UserInfo;
	isLogin: boolean;
}
