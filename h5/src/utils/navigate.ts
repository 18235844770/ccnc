/** TabBar 页面路径（只能用 switchTab 打开） */
export const TAB_PAGES = new Set([
  "/pages/index/index",
  "/pages/explore/index",
  "/pages/carbon/index",
  "/pages/user/index",
]);

function normalizePath(url: string) {
  let raw = (url || "").trim();
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // keep original
  }
  const hashIndex = raw.lastIndexOf("#/");
  if (hashIndex >= 0) {
    raw = raw.slice(hashIndex + 1);
  }
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return path.split("?")[0].replace(/\/$/, "") || path.split("?")[0];
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
 * 登录成功后跳转。tabBar 页必须用 switchTab，redirectTo 会报
 * `redirectTo:fail can not redirectTo a tabbar page`。
 */
export function safeNavigate(url: string, fallback = "/pages/index/index") {
  const fallbackPath = normalizePath(fallback);
  const pathOnly = normalizePath(url) || fallbackPath;
  const queryIndex = (url || "").indexOf("?");
  const query = queryIndex >= 0 ? url.slice(queryIndex) : "";

  if (TAB_PAGES.has(pathOnly)) {
    uni.switchTab({
      url: pathOnly,
      fail: () => uni.reLaunch({ url: pathOnly }),
    });
    return;
  }

  const target = `${pathOnly}${query}`;
  uni.redirectTo({
    url: target,
    fail: () => {
      uni.reLaunch({
        url: target,
        fail: () => uni.switchTab({ url: fallbackPath }),
      });
    },
  });
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
