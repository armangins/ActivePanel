import { cn } from "@/lib/utils";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from "react";

const LayersIcon = forwardRef(
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

        const rectVariants = {
            normal: { opacity: 1, scale: 1, x: 0, y: 0 },
            animate: (custom) => ({
                scale: [1, 1.1, 1],
                transition: {
                    delay: custom * 0.1,
                    duration: duration,
                }
            })
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
                >
                    {/* Top Right */}
                    <motion.path
                        d="M13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6z"
                        variants={rectVariants}
                        custom={1}
                    />
                    {/* Top Left */}
                    <motion.path
                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z"
                        variants={rectVariants}
                        custom={0}
                    />
                    {/* Bottom Right */}
                    <motion.path
                        d="M13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                        variants={rectVariants}
                        custom={2}
                    />
                    {/* Bottom Left */}
                    <motion.path
                        d="M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z"
                        variants={rectVariants}
                        custom={3}
                    />
                </motion.svg>
            </motion.div>
        );
    },
);

LayersIcon.displayName = "LayersIcon";
export { LayersIcon };
