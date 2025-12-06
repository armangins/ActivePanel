
import { cn } from "@/lib/utils";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from "react";

const CircleCheckBigIcon = forwardRef(
    (
        {
            onMouseEnter,
            onMouseLeave,
            className,
            size = 24,
            duration = 1,
            isAnimated = true,
            autoplay = false,
            ...props
        },
        ref,
    ) => {
        const controls = useAnimation();
        const tickControls = useAnimation();
        const reduced = useReducedMotion();
        const isControlled = useRef(false);

        useEffect(() => {
            if (autoplay && !reduced) {
                controls.start("animate");
                tickControls.start("animate");
            }
        }, [autoplay, reduced, controls, tickControls]);

        useImperativeHandle(ref, () => {
            isControlled.current = true;
            return {
                startAnimation: () => {
                    if (reduced) {
                        controls.start("normal");
                        tickControls.start("normal");
                    } else {
                        controls.start("animate");
                        tickControls.start("animate");
                    }
                },
                stopAnimation: () => {
                    controls.start("normal");
                    tickControls.start("normal");
                },
            };
        });

        const handleEnter = useCallback(
            (e) => {
                if (!isAnimated || reduced || autoplay) return;
                if (!isControlled.current) {
                    controls.start("animate");
                    tickControls.start("animate");
                } else {
                    onMouseEnter?.(e);
                }
            },
            [controls, tickControls, reduced, onMouseEnter, isAnimated, autoplay],
        );

        const handleLeave = useCallback(
            (e) => {
                if (autoplay) return;
                if (!isControlled.current) {
                    controls.start("normal");
                    tickControls.start("normal");
                } else {
                    onMouseLeave?.(e);
                }
            },
            [controls, tickControls, onMouseLeave, autoplay],
        );

        const svgVariants = {
            normal: { scale: 1 },
            animate: {
                scale: [1, 1.05, 0.98, 1],
                transition: {
                    duration: 1 * duration,
                    ease: [0.42, 0, 0.58, 1],
                },
            },
        };

        const circleVariants = {
            normal: { pathLength: 1, opacity: 1 },
            animate: { pathLength: 1, opacity: 1 },
        };

        const tickVariants = {
            normal: { pathLength: 1, opacity: 1 },
            animate: {
                pathLength: [0, 1],
                opacity: 1,
                transition: {
                    duration: 0.8 * duration,
                    ease: [0.42, 0, 0.58, 1],
                },
            },
        };

        return (
            <motion.div
                className={cn("inline-flex items-center justify-center", className)}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                {...props}
            >
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={controls}
                    initial="normal"
                    variants={svgVariants}
                >
                    <motion.path
                        d="M21.801 10A10 10 0 1 1 17 3.335"
                        variants={circleVariants}
                        initial="normal"
                    />
                    <motion.path
                        d="m9 11 3 3L22 4"
                        animate={tickControls}
                        initial="normal"
                        variants={tickVariants}
                    />
                </motion.svg>
            </motion.div>
        );
    },
);

CircleCheckBigIcon.displayName = "CircleCheckBigIcon";
export { CircleCheckBigIcon };
