/**
 * API 响应解析辅助
 * 兼容 { data }、{ records }、直接数组 等格式
 */
export function getListData<T>(res: any): T[] {
	if (!res) return [];
	if (Array.isArray(res)) return res;
	if (Array.isArray(res?.data)) return res.data;
	if (Array.isArray(res?.data?.records)) return res.data.records;
	if (Array.isArray(res?.records)) return res.records;
	return [];
}

export function getPageData<T>(res: any): { list: T[]; total: number } {
	const list = getListData<T>(res);
	const total = res?.data?.total ?? res?.total ?? list?.length ?? 0;
	return { list, total };
}
