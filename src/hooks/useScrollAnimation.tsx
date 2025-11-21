import { useEffect, useRef } from 'react';

export const useScrollAnimation = (animationType: 'up' | 'left' | 'right' = 'up') => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        element.classList.add('scroll-animate', `animate-in-${animationType}`);
                        observer.unobserve(element); // Animate only once
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [animationType]);

    return ref;
};
