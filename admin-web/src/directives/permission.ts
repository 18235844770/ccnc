import type { App, Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '@/store/modules/user';

function hasPermission(value: string | string[]): boolean {
  const userStore = useUserStore();
  if (userStore.roles.includes('admin')) {
    return true;
  }
  const permissions = userStore.permissions || [];
  if (permissions.includes('*:*:*')) {
    return true;
  }
  const required = Array.isArray(value) ? value : [value];
  if (!required.length) {
    return true;
  }
  return required.some((item) => permissions.includes(item));
}

function applyPermission(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
  const { value } = binding;
  if (!value) {
    return;
  }
  if (!hasPermission(value)) {
    el.style.display = 'none';
  } else {
    el.style.display = '';
  }
}

const permissionDirective: Directive = {
  mounted(el, binding) {
    applyPermission(el as HTMLElement, binding);
  },
  updated(el, binding) {
    applyPermission(el as HTMLElement, binding);
  },
};

export function setupPermissionDirective(app: App) {
  app.directive('permission', permissionDirective);
}

export { hasPermission };
