import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import './style.css';
import App from './App.vue';
import router from './router';
import store from './store';
import './router/guard/permission'; // Import permission guard
import { setupPermissionDirective } from './directives/permission';

const app = createApp(App);

app.use(ArcoVue);
app.use(router);
app.use(store);
setupPermissionDirective(app);

app.mount('#app');
