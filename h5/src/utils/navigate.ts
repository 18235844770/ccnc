/** TabBar 页面路径（只能用 switchTab 打开） */
const TAB_PAGES = new Set([
  "/pages/index/index",
  "/pages/explore/index",
  "/pages/carbon/index",
  "/pages/user/index",
]);

function normalizePath(url: string) {
  const path = url.startsWith("/") ? url : `/${url}`;
  return path.split("?")[0];
}

function goFallback(fallback: string) {
  const path = normalizePath(fallback);
  if (TAB_PAGES.has(path)) {
    uni.switchTab({ url: path });
    return;
  }
  uni.reLaunch({ url: fallback.startsWith("/") ? fallback : `/${fallback}` });
}

/**
 * 安全返回上一页。
 * H5 刷新 / 直达 / 页面栈仅 1 层时 `uni.navigateBack` 会失败，需落到 fallback。
 */
export function safeNavigateBack(fallback = "/pages/index/index") {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({
      delta: 1,
      fail: () => goFallback(fallback),
    });
    return;
  }
  goFallback(fallback);
}
