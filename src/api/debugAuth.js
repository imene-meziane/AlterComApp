/**
 * Debug utilities for JWT authentication
 * Use in browser console: window.debugAuth()
 */

import { getStore } from '../store';

export const debugAuth = () => {
  const store = getStore();
  const state = store.getState();
  const userData = state?.app?.userData;

  console.group('🔐 JWT Authentication Debug');
  
  console.log('📦 Redux State (app.userData):', userData);
  console.log('🔑 Auth Token:', userData?.authToken ? userData.authToken.substring(0, 50) + '...' : '❌ MISSING');
  console.log('👤 User Email:', userData?.email || '❌ MISSING');
  console.log('👤 User ID:', userData?.id || '❌ MISSING');
  console.log('🔄 Refresh Token:', userData?.refreshToken ? userData.refreshToken.substring(0, 50) + '...' : '❌ MISSING');
  
  console.group('💾 LocalStorage/IndexedDB');
  try {
    const persistedState = localStorage.getItem('persist:root');
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      const appData = JSON.parse(parsed.app);
      console.log('Persisted auth token:', appData?.userData?.authToken ? appData.userData.authToken.substring(0, 50) + '...' : '❌ MISSING');
    }
  } catch (e) {
    console.log('Could not read localStorage');
  }
  console.groupEnd();

  console.log('✅ To test authentication:');
  console.log('1. Open Network tab in DevTools');
  console.log('2. Look for API requests with Authorization header');
  console.log('3. Header should be: Authorization: Bearer <token>');
  
  console.groupEnd();
};

// Export for use
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}

export default debugAuth;
