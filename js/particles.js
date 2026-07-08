/* ============================================================
   particles.js — Canvas space background.
   Stars + drifting particles + parallax planets that react to
   the cursor. Pure Canvas 2D, no dependencies.
   Respects reduced-motion (OS preference or in-page toggle).
   ============================================================ */

(function () {
    "use strict";

    const canvas = document.getElementById("space-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let stars = [];
    let particles = [];
    let planets = [];

    // Pointer state (normalized -1..1 around center) for parallax
    const pointer = { x: 0, y: 0, px: 0, py: 0, active: false };

    let rafId = null;
    let running = false;

    const COLORS = ["#4fd6ff", "#2b8bff", "#8a6bff", "#ffffff"];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function motionDisabled() {
        const osReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const toggled = document.documentElement.getAttribute("data-motion") === "off";
        return osReduce || toggled;
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        build();
    }

    function build() {
        const area = width * height;

        // Stars: static twinkling dots
        const starCount = Math.min(220, Math.floor(area / 7000));
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: rand(0, width),
                y: rand(0, height),
                r: rand(0.4, 1.4),
                twk: rand(0, Math.PI * 2),
                depth: rand(0.2, 1)
            });
        }

        // Drifting particles that react to cursor
        const partCount = Math.min(90, Math.floor(area / 22000));
        particles = [];
        for (let i = 0; i < partCount; i++) {
            particles.push({
                x: rand(0, width),
                y: rand(0, height),
                vx: rand(-0.15, 0.15),
                vy: rand(-0.15, 0.15),
                r: rand(0.8, 2.2),
                color: COLORS[Math.floor(rand(0, COLORS.length))],
                depth: rand(0.3, 1)
            });
        }

        // A few parallax planets
        planets = [
            { x: width * 0.82, y: height * 0.28, r: Math.max(70, width * 0.07),
              hue: ["#17408b", "#0f2657"], ring: true, depth: 0.5, spin: 0 },
            { x: width * 0.15, y: height * 0.75, r: Math.max(45, width * 0.045),
              hue: ["#8a6bff", "#3a2a7a"], ring: false, depth: 0.8, spin: 0 },
            { x: width * 0.5, y: height * 1.05, r: Math.max(120, width * 0.12),
              hue: ["#0a1a3f", "#050c24"], ring: false, depth: 0.3, spin: 0 }
        ];
    }

    function drawPlanet(p) {
        const ox = -pointer.x * 40 * p.depth;
        const oy = -pointer.y * 40 * p.depth;
        const cx = p.x + ox;
        const cy = p.y + oy;

        // Body
        const grad = ctx.createRadialGradient(
            cx - p.r * 0.3, cy - p.r * 0.3, p.r * 0.1,
            cx, cy, p.r
        );
        grad.addColorStop(0, p.hue[0]);
        grad.addColorStop(1, p.hue[1]);
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Soft atmosphere glow
        ctx.beginPath();
        ctx.strokeStyle = "rgba(79, 214, 255, 0.12)";
        ctx.lineWidth = 6;
        ctx.arc(cx, cy, p.r + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Optional ring
        if (p.ring) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.5 + p.spin);
            ctx.scale(1, 0.32);
            ctx.beginPath();
            ctx.strokeStyle = "rgba(143, 179, 255, 0.35)";
            ctx.lineWidth = 4;
            ctx.arc(0, 0, p.r * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    function frame(time) {
        ctx.clearRect(0, 0, width, height);

        // Ease pointer toward target for smooth parallax
        pointer.x += (pointer.px - pointer.x) * 0.06;
        pointer.y += (pointer.py - pointer.y) * 0.06;

        // Planets (back to front by depth)
        planets.forEach(function (p) {
            p.spin += 0.0008;
            drawPlanet(p);
        });

        // Stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const tw = 0.5 + 0.5 * Math.sin(time * 0.002 + s.twk);
            const ox = -pointer.x * 12 * s.depth;
            const oy = -pointer.y * 12 * s.depth;
            ctx.beginPath();
            ctx.fillStyle = "rgba(234, 242, 255," + (0.35 + tw * 0.5) + ")";
            ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Particles: drift + cursor attraction
        for (let i = 0; i < particles.length; i++) {
            const pt = particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;

            // Cursor interaction (attract when nearby)
            if (pointer.active) {
                const mx = (pointer.px * 0.5 + 0.5) * width;
                const my = (pointer.py * 0.5 + 0.5) * height;
                const dx = mx - pt.x;
                const dy = my - pt.y;
                const dist2 = dx * dx + dy * dy;
                if (dist2 < 26000 && dist2 > 1) {
                    const f = 0.6 / Math.sqrt(dist2);
                    pt.vx += dx * f * 0.04;
                    pt.vy += dy * f * 0.04;
                }
            }

            // Friction + clamp speed
            pt.vx *= 0.99;
            pt.vy *= 0.99;
            const sp = Math.hypot(pt.vx, pt.vy);
            if (sp > 1.4) { pt.vx = (pt.vx / sp) * 1.4; pt.vy = (pt.vy / sp) * 1.4; }

            // Wrap around edges
            if (pt.x < -10) pt.x = width + 10;
            if (pt.x > width + 10) pt.x = -10;
            if (pt.y < -10) pt.y = height + 10;
            if (pt.y > height + 10) pt.y = -10;

            const ox = -pointer.x * 26 * pt.depth;
            const oy = -pointer.y * 26 * pt.depth;
            ctx.beginPath();
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = 0.7 * pt.depth;
            ctx.arc(pt.x + ox, pt.y + oy, pt.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Link nearby particles with faint lines (constellation effect)
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 12000) {
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(79, 214, 255," + (0.12 * (1 - d2 / 12000)) + ")";
                    ctx.lineWidth = 1;
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        rafId = requestAnimationFrame(frame);
    }

    // Static single-frame render for reduced-motion mode
    function renderStatic() {
        ctx.clearRect(0, 0, width, height);
        planets.forEach(drawPlanet);
        stars.forEach(function (s) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(234, 242, 255, 0.6)";
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        particles.forEach(function (pt) {
            ctx.beginPath();
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = 0.6;
            ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function start() {
        if (running) return;
        if (motionDisabled()) { renderStatic(); return; }
        running = true;
        rafId = requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    // ---------- Events ----------
    function onPointerMove(clientX, clientY) {
        pointer.px = (clientX / width) * 2 - 1;
        pointer.py = (clientY / height) * 2 - 1;
        pointer.active = true;
    }

    window.addEventListener("mousemove", function (e) {
        onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener("touchmove", function (e) {
        if (e.touches && e.touches[0]) {
            onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener("mouseleave", function () { pointer.active = false; });

    window.addEventListener("resize", function () {
        resize();
        if (!running) renderStatic();
    });

    // Pause when tab is hidden to save resources
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) { stop(); }
        else { start(); }
    });

    // React to motion preference changes
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function () {
        stop();
        start();
    });

    // Public API so the Motion toggle can restart the loop
    window.SpaceBG = {
        refresh: function () { stop(); start(); }
    };

    // ---------- Init ----------
    resize();
    start();
})();
