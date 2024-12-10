import { user } from '../stores/auth';

interface TokenData {
  exp: number;
  sub: string;
}

function parseJwt(token: string): TokenData | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const tokenData = parseJwt(token);
  if (!tokenData) return true;
  
  // Check if token will expire in the next 5 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  return tokenData.exp <= currentTime + 300; // 300 seconds = 5 minutes
}

export async function refreshTokenIfNeeded(): Promise<boolean> {
  const currentUser = user.get();
  if (!currentUser) return false;

  if (isTokenExpired(currentUser.token)) {
    try {
      const response = await fetch('https://yinshubackend-tahvnwgkdq.cn-hangzhou.fcapp.run/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        user.set({
          ...currentUser,
          token: data.access_token
        });
        return true;
      } else {
        // If refresh fails, log out the user
        user.set(null);
        return false;
      }
    } catch (error) {
      user.set(null);
      return false;
    }
  }

  return true;
}