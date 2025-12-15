/**
 * Authentication Flow Tester
 * 
 * Comprehensive testing utility to track and debug the authentication flow.
 * This helps identify where issues occur in the login/OAuth process.
 */

class AuthFlowTester {
  constructor() {
    this.steps = [];
    this.startTime = Date.now();
    this.enabled = import.meta.env.DEV;
  }

  /**
   * Log a step in the authentication flow
   * @param {string} component - Component or function name
   * @param {string} step - Step description
   * @param {Object} data - Additional data to log
   */
  logStep(component, step, data = {}) {
    if (!this.enabled) return;

    const timestamp = Date.now() - this.startTime;
    const stepData = {
      timestamp,
      component,
      step,
      data: {
        ...data,
        time: new Date().toISOString(),
      },
    };

    this.steps.push(stepData);
    
    console.log(`[AuthFlowTester] [${timestamp}ms] ${component} - ${step}`, data);
    
    // Also log to localStorage for persistence across page reloads
    try {
      const existingLogs = JSON.parse(localStorage.getItem('authFlowLogs') || '[]');
      existingLogs.push(stepData);
      // Keep only last 100 steps
      if (existingLogs.length > 100) {
        existingLogs.shift();
      }
      localStorage.setItem('authFlowLogs', JSON.stringify(existingLogs));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Log authentication state check
   * @param {string} component - Component name
   * @param {Object} authState - Authentication state
   */
  logAuthState(component, authState) {
    this.logStep(component, 'Auth State Check', {
      isAuthenticated: authState.isAuthenticated,
      hasUser: !!authState.user,
      hasAccessToken: !!authState.accessToken,
      hasLocalStorageToken: !!localStorage.getItem('accessToken'),
      loading: authState.loading,
      user: authState.user ? { id: authState.user.id, email: authState.user.email } : null,
    });
  }

  /**
   * Log navigation event
   * @param {string} from - Source route
   * @param {string} to - Destination route
   * @param {string} reason - Reason for navigation
   */
  logNavigation(from, to, reason = '') {
    this.logStep('Navigation', `Navigate: ${from} → ${to}`, { reason });
  }

  /**
   * Get all logged steps
   * @returns {Array} Array of logged steps
   */
  getSteps() {
    return this.steps;
  }

  /**
   * Get steps from localStorage
   * @returns {Array} Array of logged steps
   */
  getPersistedSteps() {
    try {
      return JSON.parse(localStorage.getItem('authFlowLogs') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.steps = [];
    this.startTime = Date.now();
    try {
      localStorage.removeItem('authFlowLogs');
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Generate a flow report
   * @returns {string} Formatted report
   */
  generateReport() {
    const steps = this.getPersistedSteps();
    if (steps.length === 0) {
      return 'No authentication flow logs found.';
    }

    let report = '\n=== AUTHENTICATION FLOW REPORT ===\n\n';
    report += `Total Steps: ${steps.length}\n`;
    report += `Duration: ${steps[steps.length - 1]?.timestamp || 0}ms\n\n`;

    steps.forEach((step, index) => {
      report += `${index + 1}. [${step.timestamp}ms] ${step.component} - ${step.step}\n`;
      if (Object.keys(step.data).length > 0) {
        report += `   Data: ${JSON.stringify(step.data, null, 2).replace(/\n/g, '\n   ')}\n`;
      }
      report += '\n';
    });

    return report;
  }

  /**
   * Print report to console
   */
  printReport() {
    console.log(this.generateReport());
  }

  /**
   * Check for common issues in the flow
   * @returns {Array} Array of detected issues
   */
  detectIssues() {
    const steps = this.getPersistedSteps();
    const issues = [];

    // Check for missing token after login
    const loginStep = steps.find(s => s.step.includes('login() completed'));
    if (loginStep) {
      const afterLogin = steps.filter(s => s.timestamp > loginStep.timestamp);
      const hasTokenCheck = afterLogin.find(s => 
        s.step.includes('Auth State Check') && 
        s.data.hasLocalStorageToken === false
      );
      if (hasTokenCheck) {
        issues.push({
          type: 'missing_token_after_login',
          message: 'Token missing after login() completed',
          step: hasTokenCheck,
        });
      }
    }

    // Check for navigation to login after authentication
    const authConfirmed = steps.find(s => 
      s.step.includes('Authentication confirmed') || 
      (s.step.includes('Auth State Check') && s.data.isAuthenticated === true)
    );
    if (authConfirmed) {
      const afterAuth = steps.filter(s => s.timestamp > authConfirmed.timestamp);
      const redirectToLogin = afterAuth.find(s => 
        s.step.includes('Navigate') && s.data.reason?.includes('login')
      );
      if (redirectToLogin) {
        issues.push({
          type: 'redirect_to_login_after_auth',
          message: 'Redirected to login page after authentication was confirmed',
          step: redirectToLogin,
        });
      }
    }

    // Check for initialization interference
    const loginCalled = steps.find(s => s.step.includes('login() called'));
    const initAfterLogin = steps.find(s => 
      s.timestamp > loginCalled?.timestamp && 
      s.component.includes('initAuth') &&
      s.step.includes('continuing with normal init')
    );
    if (initAfterLogin) {
      issues.push({
        type: 'init_interference',
        message: 'Initialization continued after login() was called',
        step: initAfterLogin,
      });
    }

    return issues;
  }
}

// Create singleton instance
const authFlowTester = new AuthFlowTester();

// Export for use in components
export default authFlowTester;

// Also add to window for easy console access
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.authFlowTester = authFlowTester;
  console.log('[AuthFlowTester] Available in console as window.authFlowTester');
  console.log('[AuthFlowTester] Commands:');
  console.log('  - window.authFlowTester.printReport() - Print flow report');
  console.log('  - window.authFlowTester.detectIssues() - Detect common issues');
  console.log('  - window.authFlowTester.clearLogs() - Clear all logs');
  console.log('  - window.authFlowTester.getPersistedSteps() - Get all steps');
}

