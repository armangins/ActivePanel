/**
 * Authentication Debugger
 * 
 * Comprehensive debugging utility for authentication issues.
 * Use this in the browser console to diagnose auth problems.
 */

/**
 * Get current authentication state
 */
export const getAuthState = () => {
  const state = {
    localStorage: {
      accessToken: localStorage.getItem('accessToken'),
      userData: localStorage.getItem('userData'),
      last429ErrorTime: localStorage.getItem('last429ErrorTime'),
      authFlowLogs: localStorage.getItem('authFlowLogs'),
    },
    token: {
      exists: !!localStorage.getItem('accessToken'),
      value: localStorage.getItem('accessToken'),
      decoded: null,
      expired: null,
      expiresAt: null,
    },
    user: {
      exists: !!localStorage.getItem('userData'),
      value: null,
    },
    cookies: {
      csrfToken: document.cookie.split('; ').find(row => row.startsWith('csrf-token='))?.split('=')[1] || null,
      refreshToken: document.cookie.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1] || null,
      allCookies: document.cookie,
    },
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  // Decode token if exists
  if (state.token.value) {
    try {
      const payload = JSON.parse(atob(state.token.value.split('.')[1]));
      state.token.decoded = payload;
      const now = Math.floor(Date.now() / 1000);
      state.token.expired = payload.exp < now;
      state.token.expiresAt = new Date(payload.exp * 1000).toISOString();
      state.token.expiresIn = payload.exp - now;
    } catch (e) {
      state.token.error = e.message;
    }
  }

  // Parse user data if exists
  if (state.user.exists) {
    try {
      state.user.value = JSON.parse(state.localStorage.userData);
    } catch (e) {
      state.user.error = e.message;
    }
  }

  return state;
};

/**
 * Print formatted auth state to console
 */
export const printAuthState = () => {
  const state = getAuthState();
  console.group('🔐 Current Authentication State');
  console.log('Timestamp:', state.timestamp);
  console.log('Current Path:', state.currentPath);
  
  console.group('📦 LocalStorage');
  console.log('Access Token:', state.localStorage.accessToken ? '✅ Present' : '❌ Missing');
  console.log('User Data:', state.localStorage.userData ? '✅ Present' : '❌ Missing');
  console.log('Last 429 Error:', state.localStorage.last429ErrorTime || 'None');
  console.groupEnd();
  
  console.group('🎫 Token');
  console.log('Exists:', state.token.exists ? '✅' : '❌');
  if (state.token.value) {
    console.log('Expired:', state.token.expired ? '❌ YES' : '✅ NO');
    console.log('Expires At:', state.token.expiresAt);
    console.log('Expires In:', state.token.expiresIn, 'seconds');
    console.log('Payload:', state.token.decoded);
  }
  console.groupEnd();
  
  console.group('👤 User');
  console.log('Exists:', state.user.exists ? '✅' : '❌');
  if (state.user.value) {
    console.log('User Data:', state.user.value);
  }
  console.groupEnd();
  
  console.group('🍪 Cookies');
  console.log('CSRF Token:', state.cookies.csrfToken ? '✅ Present' : '❌ Missing');
  console.log('Refresh Token:', state.cookies.refreshToken ? '✅ Present' : '❌ Missing');
  console.log('All Cookies:', state.cookies.allCookies || 'None');
  console.groupEnd();
  
  console.groupEnd();
  return state;
};

/**
 * Check if authentication should work based on localStorage
 */
export const shouldBeAuthenticated = () => {
  const state = getAuthState();
  const hasToken = !!state.token.value;
  const hasUser = !!state.user.value;
  const tokenValid = hasToken && !state.token.expired;
  
  const result = {
    shouldBeAuthenticated: hasToken && hasUser && tokenValid,
    reasons: [],
    warnings: [],
  };
  
  if (!hasToken) {
    result.reasons.push('❌ No access token in localStorage');
  } else if (state.token.expired) {
    result.reasons.push(`❌ Token expired at ${state.token.expiresAt}`);
  } else {
    result.reasons.push('✅ Token exists and is valid');
  }
  
  if (!hasUser) {
    result.reasons.push('❌ No user data in localStorage');
  } else {
    result.reasons.push('✅ User data exists');
  }
  
  if (hasToken && !hasUser) {
    result.warnings.push('⚠️ Token exists but no user data - this might cause issues');
  }
  
  if (hasToken && state.token.expired) {
    result.warnings.push('⚠️ Token expired - refresh should be attempted');
  }
  
  return result;
};

/**
 * Get recent auth flow logs
 */
export const getRecentLogs = (limit = 20) => {
  try {
    const logs = JSON.parse(localStorage.getItem('authFlowLogs') || '[]');
    return logs.slice(-limit);
  } catch (e) {
    return [];
  }
};

/**
 * Print recent logs
 */
export const printRecentLogs = (limit = 20) => {
  const logs = getRecentLogs(limit);
  console.group(`📋 Recent Auth Flow Logs (last ${limit})`);
  logs.forEach((log, index) => {
    console.log(`[${log.timestamp}ms] ${log.component} - ${log.step}`, log.data);
  });
  console.groupEnd();
  return logs;
};

/**
 * Find logs related to a specific issue
 */
export const findLogs = (searchTerm) => {
  try {
    const logs = JSON.parse(localStorage.getItem('authFlowLogs') || '[]');
    return logs.filter(log => 
      log.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (e) {
    return [];
  }
};

/**
 * Clear all auth data (for testing)
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('last429ErrorTime');
  console.log('✅ Cleared all auth data from localStorage');
};

/**
 * Test API endpoints
 */
export const testAPI = async () => {
  const results = {
    getCurrentUser: null,
    refreshToken: null,
  };
  
  console.group('🧪 Testing API Endpoints');
  
  // Test getCurrentUser
  try {
    const { authAPI } = await import('../services/api');
    const user = await authAPI.getCurrentUser();
    results.getCurrentUser = { success: true, data: user };
    console.log('✅ getCurrentUser:', user);
  } catch (e) {
    results.getCurrentUser = { 
      success: false, 
      error: e.message,
      status: e.response?.status,
      data: e.response?.data 
    };
    console.error('❌ getCurrentUser failed:', e.message, e.response?.data);
  }
  
  // Test refreshToken
  try {
    const { authAPI } = await import('../services/api');
    const response = await authAPI.refreshToken();
    results.refreshToken = { success: true, data: response };
    console.log('✅ refreshToken:', response);
  } catch (e) {
    results.refreshToken = { 
      success: false, 
      error: e.message,
      status: e.response?.status,
      data: e.response?.data 
    };
    console.error('❌ refreshToken failed:', e.message, e.response?.data);
  }
  
  console.groupEnd();
  return results;
};

/**
 * Check if browser supports localStorage and if it's enabled
 */
export const checkStorageSupport = () => {
  const result = {
    localStorageSupported: typeof Storage !== 'undefined',
    localStorageEnabled: false,
    canWrite: false,
    canRead: false,
    error: null,
  };
  
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    result.canWrite = true;
    const value = localStorage.getItem(testKey);
    result.canRead = value === 'test';
    localStorage.removeItem(testKey);
    result.localStorageEnabled = true;
  } catch (e) {
    result.error = e.message;
  }
  
  return result;
};

// Add to window in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.authDebugger = {
    getAuthState,
    printAuthState,
    shouldBeAuthenticated,
    getRecentLogs,
    printRecentLogs,
    findLogs,
    clearAuthData,
    testAPI,
    checkStorageSupport,
  };
  
  console.log('%c🔐 Auth Debugger Available', 'color: #4CAF50; font-weight: bold; font-size: 14px');
  console.log('Available commands:');
  console.log('  - window.authDebugger.printAuthState() - Print current auth state');
  console.log('  - window.authDebugger.shouldBeAuthenticated() - Check if auth should work');
  console.log('  - window.authDebugger.printRecentLogs() - Print recent flow logs');
  console.log('  - window.authDebugger.findLogs("search") - Find logs by search term');
  console.log('  - window.authDebugger.testAPI() - Test API endpoints');
  console.log('  - window.authDebugger.checkStorageSupport() - Check localStorage support');
  console.log('  - window.authDebugger.clearAuthData() - Clear all auth data');
}

