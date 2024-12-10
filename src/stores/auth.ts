import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import { login as apiLogin } from '../config/api';

interface User {
  username: string;
  token: string;
}

export const user = persistentAtom<User | null>('user', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const isLoggedIn = computed(user, (user) => user !== null);

export async function login(username: string, password: string): Promise<boolean> {
  const response = await apiLogin(username, password);
  
  if (response.success && response.data) {
    user.set({ username, token: response.data });
    return true;
  }
  
  return false;
}

export function logout() {
  user.set(null);
}