import { useRef, useCallback } from 'react';

export default function TiltCard({ children, className = '' }) {
    const cardRef = useRef(null);
    const glowRef = useRef(null);

    const handleMove = useCallback((e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glowRef.current) {
            glowRef.current.style.opacity = '1';
            glowRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(139, 92, 246, 0.15), transparent 50%)`;
        }
    }, []);

    const handleLeave = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        if (glowRef.current) { glowRef.current.style.opacity = '0'; }
    }, []);

    return (
        <div
            ref={cardRef}
            className={`card ${className}`}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
        >
            <div ref={glowRef} className="card-glow" />
            {children}
        </div>
    );
}
