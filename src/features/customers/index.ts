export * from './types';
export * from './api/customers.service';
export * from './hooks/useCustomersData';
export * from './components/CustomersPage';
// Default export
import { CustomersPage } from './components/CustomersPage';
export * from './components/CustomersErrorBoundary';
export default CustomersPage;
