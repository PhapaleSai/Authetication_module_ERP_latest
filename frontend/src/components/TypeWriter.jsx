import { useState, useEffect } from 'react';

export default function TypeWriter({ text, speed = 50, className = '' }) {
    const [displayed, setDisplayed] = useState('');
    const [index, setIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayed(text.slice(0, index + 1));
                setIndex(index + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else {
            // Blink cursor then remove
            const timeout = setTimeout(() => setShowCursor(false), 1500);
            return () => clearTimeout(timeout);
        }
    }, [index, text, speed]);

    return (
        <span className={className}>
            {displayed}
            {showCursor && <span className="typewriter-cursor">|</span>}
        </span>
    );
}
