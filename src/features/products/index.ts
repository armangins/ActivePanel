export * from './types';
export * from './api/products.service';
export * from './hooks/useProductsData';
export * from './hooks/useProductSearch';
export * from './components/ProductsPage';
export * from './components/ProductForm/ProductForm';

// Default exports
import { ProductsPage } from './components/ProductsPage';
export * from './components/ProductsErrorBoundary';
export default ProductsPage;
