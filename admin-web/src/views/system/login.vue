<template>
  <div class="container">
    <div class="content">
      <h2 style="text-align: center; margin-bottom: 24px;">Admin Login</h2>
      <a-form :model="form" @submit="handleSubmit" layout="vertical">
        <a-form-item field="username" label="Username" :rules="[{required:true, message:'Username is required'}]">
          <a-input v-model="form.username" placeholder="admin" />
        </a-form-item>
        <a-form-item field="password" label="Password" :rules="[{required:true, message:'Password is required'}]">
          <a-input-password v-model="form.password" placeholder="password" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" long>Login</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { Message } from '@arco-design/web-vue';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const handleSubmit = async ({ values, errors }: any) => {
    if (errors) return;
    loading.value = true;
    try {
        await userStore.login(values);
        Message.success('Login Success');
        const { redirect } = router.currentRoute.value.query;
        router.push((redirect as string) || '/');
    } catch (err) {
        // Error handled
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--color-fill-2);
}
.content {
    width: 360px;
    padding: 32px;
    background: var(--color-bg-1);
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
