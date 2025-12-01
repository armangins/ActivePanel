import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect when an element enters the viewport
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} [ref, isIntersecting]
 */
const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [options]);

    return [targetRef, isIntersecting];
};

export default useIntersectionObserver;
