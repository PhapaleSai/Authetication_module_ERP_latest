import { useEffect, useRef } from 'react';

export default function Particles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        let mouse = { x: -1000, y: -1000 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

        // Stars
        const stars = Array.from({ length: 150 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.8 + 0.2,
            a: Math.random() * 0.6 + 0.2,
            speed: Math.random() * 0.25 + 0.03,
            drift: (Math.random() - 0.5) * 0.12,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.015 + 0.004,
        }));

        // Shooting stars
        let shootingStar = null;
        const maybeShoot = () => {
            if (Math.random() < 0.003 && !shootingStar) {
                shootingStar = {
                    x: Math.random() * canvas.width * 0.8,
                    y: Math.random() * canvas.height * 0.3,
                    len: 80 + Math.random() * 60,
                    speed: 8 + Math.random() * 6,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                    life: 1,
                };
            }
        };

        // Aurora waves
        const auroraWaves = [
            { yBase: 0.35, amplitude: 40, freq: 0.003, speed: 0.0008, color1: [99, 102, 241], color2: [6, 214, 160], alpha: 0.04 },
            { yBase: 0.40, amplitude: 30, freq: 0.004, speed: 0.0006, color1: [139, 92, 246], color2: [236, 72, 153], alpha: 0.03 },
            { yBase: 0.30, amplitude: 50, freq: 0.002, speed: 0.001, color1: [6, 214, 160], color2: [99, 102, 241], alpha: 0.025 },
        ];

        let tick = 0;

        const draw = () => {
            tick++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Aurora
            auroraWaves.forEach((wave) => {
                ctx.beginPath();
                const baseY = canvas.height * wave.yBase;
                ctx.moveTo(0, canvas.height);
                for (let x = 0; x <= canvas.width; x += 3) {
                    const y = baseY + Math.sin(x * wave.freq + tick * wave.speed) * wave.amplitude
                        + Math.sin(x * wave.freq * 1.5 + tick * wave.speed * 0.7) * wave.amplitude * 0.5;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();

                const grad = ctx.createLinearGradient(0, baseY - wave.amplitude, 0, canvas.height);
                grad.addColorStop(0, `rgba(${wave.color1.join(',')}, ${wave.alpha})`);
                grad.addColorStop(0.3, `rgba(${wave.color2.join(',')}, ${wave.alpha * 0.6})`);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();
            });

            // Stars
            stars.forEach((s) => {
                s.pulse += s.pulseSpeed;
                const alpha = s.a * (0.4 + 0.6 * Math.sin(s.pulse));

                const dx = s.x - mouse.x;
                const dy = s.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const boost = dist < 150 ? (1 - dist / 150) : 0;

                // Glow
                if (boost > 0.05) {
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r + boost * 12, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(165, 180, 252, ${boost * 0.12})`;
                    ctx.fill();
                }

                // Star dot
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r + boost * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 225, 255, ${Math.min(alpha + boost * 0.6, 1)})`;
                ctx.fill();

                s.y -= s.speed;
                s.x += s.drift;
                if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width; }
                if (s.x < -5) s.x = canvas.width + 5;
                if (s.x > canvas.width + 5) s.x = -5;
            });

            // Connecting lines
            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const dx = stars[i].x - stars[j].x;
                    const dy = stars[i].y - stars[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 90) {
                        ctx.beginPath();
                        ctx.moveTo(stars[i].x, stars[i].y);
                        ctx.lineTo(stars[j].x, stars[j].y);
                        ctx.strokeStyle = `rgba(165, 180, 252, ${0.055 * (1 - dist / 90)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Shooting star
            maybeShoot();
            if (shootingStar) {
                const ss = shootingStar;
                const endX = ss.x + Math.cos(ss.angle) * ss.len;
                const endY = ss.y + Math.sin(ss.angle) * ss.len;

                const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
                grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life * 0.8})`);
                grad.addColorStop(1, `rgba(165, 180, 252, 0)`);

                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ss.x += Math.cos(ss.angle) * ss.speed;
                ss.y += Math.sin(ss.angle) * ss.speed;
                ss.life -= 0.015;
                if (ss.life <= 0) shootingStar = null;
            }

            // Cursor glow
            if (mouse.x > 0 && mouse.y > 0) {
                const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
                g.addColorStop(0, 'rgba(139, 92, 246, 0.03)');
                g.addColorStop(1, 'transparent');
                ctx.fillStyle = g;
                ctx.fillRect(mouse.x - 200, mouse.y - 200, 400, 400);
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
