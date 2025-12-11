/**
 * Grid Configuration
 * 
 * Shared grid column mapping for ProductGrid and ProductGridSkeleton
 * Prevents code duplication
 */
export const gridColsClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-2 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

/**
 * Get grid class for a given number of columns
 * @param {number} columns - Number of columns
 * @param {number} defaultColumns - Default columns if not found (default: 4)
 * @returns {string} Tailwind grid class
 */
export const getGridClass = (columns, defaultColumns = 4) => {
  return gridColsClass[columns] || gridColsClass[defaultColumns];
};
