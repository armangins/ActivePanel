import { cn } from "../../lib/utils"; // Adjusted path to be relative to components/icons which is ../../lib/utils? No.
// src/components/icons/CircleCheckBigIcon.jsx uses "@/lib/utils".
// I should use "@/lib/utils" if aliasing works, or relative path.
// CircleCheckBigIcon uses @"/lib/utils".
// Wait, check user file: `import { cn } from "@/lib/utils";`
// I'll stick to that.

import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from "react";

const PackageIcon = forwardRef(
    (
        {
            onMouseEnter,
            onMouseLeave,
            className,
            size = 24,
            duration = 0.5,
            isAnimated = true,
            autoplay = false,
            ...props
        },
        ref,
    ) => {
        const controls = useAnimation();
        const reduced = useReducedMotion();
        const isControlled = useRef(false);

        useEffect(() => {
            if (autoplay && !reduced) {
                controls.start("animate");
            }
        }, [autoplay, reduced, controls]);

        useImperativeHandle(ref, () => {
            isControlled.current = true;
            return {
                startAnimation: () => {
                    if (reduced) return;
                    controls.start("animate");
                },
                stopAnimation: () => {
                    controls.start("normal");
                },
            };
        });

        const handleEnter = useCallback(
            (e) => {
                if (!isAnimated || reduced || autoplay) return;
                onMouseEnter?.(e);
                controls.start("animate");
            },
            [controls, reduced, onMouseEnter, isAnimated, autoplay],
        );

        const handleLeave = useCallback(
            (e) => {
                if (autoplay) return;
                onMouseLeave?.(e);
                controls.start("normal");
            },
            [controls, onMouseLeave, autoplay],
        );

        const pathVariants = {
            normal: { pathLength: 1, opacity: 1 },
            animate: {
                pathLength: [0, 1],
                opacity: [0, 1],
                transition: {
                    duration: duration,
                    ease: "easeInOut",
                },
            },
        };

        const boxVariants = {
            normal: { scale: 1 },
            animate: {
                scale: [1, 1.1, 1],
                transition: {
                    duration: duration,
                    ease: "easeInOut",
                },
            }
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
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial="normal"
                    animate={controls}
                    variants={boxVariants}
                >
                    <motion.path
                        d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                        variants={pathVariants}
                    />
                </motion.svg>
            </motion.div>
        );
    },
);

PackageIcon.displayName = "PackageIcon";
export { PackageIcon };
