import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to animate progress values smoothly
 * Uses requestAnimationFrame for 60fps animation
 * 
 * @param targetProgress - The target progress value (0-100)
 * @param duration - Animation duration in milliseconds (default: 800ms)
 * @returns The current animated progress value
 */
export const useAnimatedProgress = (targetProgress: number, duration: number = 800): number => {
    const [displayProgress, setDisplayProgress] = useState(0);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const startProgressRef = useRef(0);

    useEffect(() => {
        // If target is 0, reset immediately
        if (targetProgress === 0) {
            setDisplayProgress(0);
            startProgressRef.current = 0;
            return;
        }

        // If target hasn't changed significantly, don't animate
        if (Math.abs(targetProgress - displayProgress) < 0.5) {
            return;
        }

        // Cancel any ongoing animation
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
        }

        // Store starting values
        startTimeRef.current = null;
        startProgressRef.current = displayProgress;

        // Easing function (ease-out cubic for natural deceleration)
        const easeOutCubic = (t: number): number => {
            return 1 - Math.pow(1 - t, 3);
        };

        // Animation function
        const animate = (currentTime: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = currentTime;
            }

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Apply easing
            const easedProgress = easeOutCubic(progress);

            // Calculate current display value
            const currentValue = startProgressRef.current +
                (targetProgress - startProgressRef.current) * easedProgress;

            setDisplayProgress(currentValue);

            // Continue animation if not complete
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Ensure we end exactly at target
                setDisplayProgress(targetProgress);
                animationRef.current = null;
            }
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [targetProgress, duration, displayProgress]);

    return displayProgress;
};
