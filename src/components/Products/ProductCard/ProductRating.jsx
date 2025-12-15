import React from 'react';
import { StarFilled } from '@ant-design/icons';

const ProductRating = ({ rating = 0, reviewCount = 0 }) => {
  // Ensure rating is between 0 and 5
  const normalizedRating = Math.max(0, Math.min(5, parseFloat(rating) || 0));
  
  // Calculate full stars and partial star
  const fullStars = Math.floor(normalizedRating);
  const hasPartialStar = normalizedRating % 1 !== 0;
  const partialStarFill = (normalizedRating % 1) * 100;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '6px',
      marginTop: '8px'
    }}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            // Full star
            return (
              <StarFilled 
                key={index}
                style={{ 
                  fontSize: '14px', 
                  color: '#fbbf24' 
                }} 
              />
            );
          } else if (index === fullStars && hasPartialStar) {
            // Partial star
            return (
              <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                <StarFilled 
                  style={{ 
                    fontSize: '14px', 
                    color: '#e5e7eb' 
                  }} 
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${partialStarFill}%`,
                  overflow: 'hidden'
                }}>
                  <StarFilled 
                    style={{ 
                      fontSize: '14px', 
                      color: '#fbbf24' 
                    }} 
                  />
                </div>
              </div>
            );
          } else {
            // Empty star
            return (
              <StarFilled 
                key={index}
                style={{ 
                  fontSize: '14px', 
                  color: '#e5e7eb' 
                }} 
              />
            );
          }
        })}
      </div>
      
      {/* Rating number */}
      <span style={{ 
        fontSize: '14px', 
        color: '#374151',
        fontWeight: 400
      }}>
        {normalizedRating.toFixed(1)}
      </span>
    </div>
  );
};

export default ProductRating;

