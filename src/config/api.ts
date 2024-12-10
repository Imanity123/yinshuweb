export const API_BASE_URL = 'https://yinshubackend-tahvnwgkdq.cn-hangzhou.fcapp.run';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

import { refreshTokenIfNeeded } from '../utils/auth';

export async function processText(text: string, language: string, token: string): Promise<ApiResponse<string>> {
  try {
    // Try to refresh token if needed
    const isValid = await refreshTokenIfNeeded();
    if (!isValid) {
      return {
        success: false,
        error: 'Session expired. Please login again.'
      };
    }

    const response = await fetch(`${API_BASE_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text,
        language: language === 'zh' ? 'chinese' : 'english'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.detail || 'Processing failed'
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.processed_text
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error'
    };
  }
}

export async function login(username: string, password: string): Promise<ApiResponse<string>> {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.detail || 'Login failed'
      };
    }

    return {
      success: true,
      data: data.access_token
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error'
    };
  }
}

export async function register(email: string, username: string, password: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        username,
        password
      })
    });

    const data = await response.json();
    return {
      success: response.ok,
      error: !response.ok ? data.detail || 'Registration failed' : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error'
    };
  }
}