import router from '@/router';
import { useUserStore } from '@/store/modules/user';

const modules = import.meta.glob('/src/views/**/*.vue');

export function resolveComponent(compPath: string) {
  if (compPath === 'Layout') {
    return () => import('@/layout/index.vue');
  }

  let path = compPath;
  if (!path.endsWith('.vue')) {
    path += '.vue';
  }
  if (!path.startsWith('/src/')) {
    if (!path.startsWith('views/')) {
      path = `views/${path}`;
    }
    path = `/src/${path}`;
  }

  if (modules[path]) {
    return modules[path];
  }
  console.warn(`Component not found: ${path}`);
  return { template: '<div>Component not found</div>' };
}

export function generateRoutes(menus: any[], isRoot = false) {
  const routes: any[] = [];
  menus.forEach((menu) => {
    if (isRoot && menu.component !== 'Layout') {
      routes.push({
        path: '/',
        component: () => import('@/layout/index.vue'),
        children: [
          {
            path: menu.path.startsWith('/') ? menu.path.substring(1) : menu.path,
            name: menu.name,
            component: resolveComponent(menu.component),
            meta: { ...menu.meta, title: menu.name },
          },
        ],
      });
    } else {
      const route: any = {
        path: menu.path,
        name: menu.name,
        meta: { ...menu.meta, title: menu.name },
        component: resolveComponent(menu.component),
        children: [],
      };
      if (menu.children?.length) {
        route.children = generateRoutes(menu.children, false);
      }
      routes.push(route);
    }
  });
  return routes;
}

export function setupDynamicRoutes(menus: any[]) {
  const accessRoutes = generateRoutes(menus, true);
  accessRoutes.forEach((route) => {
    router.addRoute(route);
  });
}

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const token = localStorage.getItem('token');

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' });
    } else if (!userStore.routesLoaded) {
      try {
        if (userStore.menus.length === 0) {
          await userStore.fetchUserInfo();
          await userStore.fetchMenus();
        }
        if (userStore.roles.length === 0) {
          userStore.roles = ['admin'];
        }
        setupDynamicRoutes(userStore.menus);
        userStore.routesLoaded = true;
        next({ ...to, replace: true });
      } catch (error) {
        console.error(error);
        userStore.logout();
        next(`/login?redirect=${to.path}`);
      }
    } else {
      next();
    }
  } else if (to.path === '/login') {
    next();
  } else {
    next(`/login?redirect=${to.path}`);
  }
});
