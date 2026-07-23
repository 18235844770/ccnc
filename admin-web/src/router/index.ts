import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard', // Matches the name in SQL/Menu
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/system/login.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
