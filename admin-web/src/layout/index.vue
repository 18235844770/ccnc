<template>
  <a-layout class="app-layout">
    <a-layout-sider class="app-sider" collapsible breakpoint="xl">
      <div class="logo" />
      <a-menu
        :default-open-keys="['System']"
        :default-selected-keys="[$route.name]"
        :style="{ width: '100%' }"
        @menu-item-click="onClickMenuItem"
      >
        <template v-for="item in menuTree" :key="item.id">
            <a-sub-menu v-if="item.children && item.children.length" :key="item.name">
                <template #title>
                    <component :is="item.icon ? `icon-${item.icon}` : 'icon-apps'" />
                    <span style="margin-left: 8px;">{{ item.name }}</span>
                </template>
                <a-menu-item v-for="child in item.children" :key="child.name">
                    {{ child.name }}
                </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.name">
                <component :is="item.icon ? `icon-${item.icon}` : 'icon-apps'" />
                <span style="margin-left: 8px;">{{ item.name }}</span>
            </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="app-header">
        <div>后台管理系统</div>
        <a-dropdown @select="handleSelect">
            <a-avatar style="background-color: #3370ff; cursor: pointer;">
                <IconUser />
            </a-avatar>
            <template #content>
                <a-doption value="logout">退出登录</a-doption>
            </template>
        </a-dropdown>
      </a-layout-header>
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { 
  IconApps, IconUser, IconDashboard, IconSetting, 
  IconUser as IconUserGroup, IconTeam, IconMenu, 
  IconFileText, IconUnorderedList, IconShopping, 
  IconGift, IconShareAlt, IconMoneyCollect, 
  IconFileSearch, IconGold, IconBank, IconAccountBook 
} from '@arco-design/web-vue/es/icon';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const menuTree = computed(() => userStore.menus);

const onClickMenuItem = (key: string) => {
    // Find the route by name
    router.push({ name: key });
};

const handleSelect = async (value: any) => {
    if (value === 'logout') {
        userStore.logout();
        router.push('/login');
    }
};
</script>

<style scoped>
.logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
.app-layout {
  height: 100vh;
  background: #f5f7fb;
}
.app-sider {
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
}
.app-header {
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.app-content {
  padding: 20px;
  overflow: auto;
}
</style>
