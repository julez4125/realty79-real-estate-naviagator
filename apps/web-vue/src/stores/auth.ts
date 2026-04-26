import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('r79_token'));
  const user = ref<any>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data?.data ?? res.data;
    if (data.token) {
      token.value = data.token;
      localStorage.setItem('r79_token', data.token);
    }
    await fetchProfile();
    router.push('/dashboard');
  }

  async function register(data: { email: string; name: string; password: string }) {
    const res = await api.post('/auth/register', data);
    const result = res.data?.data ?? res.data;
    if (result.token) {
      token.value = result.token;
      localStorage.setItem('r79_token', result.token);
    }
    await fetchProfile();
    router.push('/dashboard');
  }

  async function fetchProfile() {
    try {
      const res = await api.get('/auth/profile');
      user.value = res.data?.data ?? res.data;
    } catch {
      // silent fail
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('r79_token');
    router.push('/login');
  }

  return { token, user, isAuthenticated, login, register, fetchProfile, logout };
});
