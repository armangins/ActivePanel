export * from './types';
export * from './api/coupons.service';
export * from './hooks/useCouponsData';
export * from './components/CouponsPage';
export * from './components/CouponForm/CouponModal';

import { CouponsPage } from './components/CouponsPage';
export * from './components/CouponsErrorBoundary';
export default CouponsPage;
