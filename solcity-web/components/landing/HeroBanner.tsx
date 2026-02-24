"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * HeroBanner Component
 *
 * Main hero section of the landing page with animated background effects.
 * Features interactive canvas animations and call-to-action buttons.
 *
 * Features:
 * - Animated data streams on canvas (simulating blockchain transactions)
 * - Mouse tracking for interactive gradient effects
 * - Pulsing blockchain block animations
 * - Grid background with radial mask
 * - CTA buttons for merchants and customers
 * - Responsive design with gradient text effects
 *
 * Animation Details:
 * - DataStream class creates falling vertical lines with gradient effects
 * - 12 concurrent data streams animate continuously
 * - Mouse position updates CSS custom properties for gradient following
 */
export default function HeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      hero.style.setProperty("--mouse-x", `${mouseX}px`);
      hero.style.setProperty("--mouse-y", `${mouseY}px`);
    };

    hero.addEventListener("mousemove", handleMouseMove);

    // Data streams animation
    class DataStream {
      x = 0;
      y = 0;
      speed = 0;
      length = 0;
      opacity = 0;

      constructor() {
        this.reset();
      }

      reset() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.speed = Math.random() * 2 + 1;
        this.length = Math.random() * 100 + 50;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        if (!canvas) return;
        this.y += this.speed;
        if (this.y > canvas.height + 100) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createLinearGradient(
          this.x,
          this.y - this.length,
          this.x,
          this.y,
        );
        gradient.addColorStop(0, "rgba(208, 255, 20, 0)");
        gradient.addColorStop(0.5, `rgba(208, 255, 20, ${this.opacity})`);
        gradient.addColorStop(1, "rgba(208, 255, 20, 0)");

        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.length);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = `rgba(208, 255, 20, ${this.opacity + 0.3})`;
        ctx.fillRect(this.x - 3, this.y - 6, 6, 6);
      }
    }

    const dataStreams: DataStream[] = [];
    for (let i = 0; i < 12; i++) {
      dataStreams.push(new DataStream());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const stream of dataStreams) {
        stream.update();
        stream.draw();
      }
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative py-24 bg-black border-b border-border overflow-hidden before:content-[''] before:absolute before:w-[600px] before:h-[600px] before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-[radial-gradient(circle,rgba(208,255,20,0.2)_0%,transparent_70%)] before:transition-all before:duration-300 before:pointer-events-none after:content-[''] after:absolute after:-top-1/2 after:-right-1/5 after:w-[800px] after:h-[800px] after:bg-[radial-gradient(circle,rgba(208,255,20,0.1)_0%,transparent_70%)] after:animate-pulse-glow"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(#222_1px,transparent_1px),linear-gradient(90deg,#222_1px,transparent_1px)] bg-size-[50px_50px] opacity-30 mask-[radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />

      <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`blockchain-block-${i}`}
            className="absolute left-1/2 top-1/2 w-[60px] h-[60px] border-2 border-accent -translate-x-1/2 -translate-y-1/2 opacity-0 animate-block-pulse"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-8">
        <h1 className="text-[3.5rem] font-medium tracking-tight mb-6 max-w-[700px]">
          Reward customers with{" "}
          <span className="bg-linear-to-br from-accent to-white bg-clip-text text-transparent">
            blockchain tokens.
          </span>
        </h1>

        <p className="text-text-secondary text-lg leading-relaxed max-w-[600px] mb-10">
          Solcity empowers businesses to manage decentralized loyalty programs
          using Solana's Token Extensions. Fast, transparent, and owned by
          customers.
        </p>

        <div className="flex gap-4">
          <Link
            href="/merchant/register"
            className="bg-accent text-black px-10 py-4 border-none font-semibold text-[0.95rem] cursor-pointer rounded transition-all duration-300 shadow-[0_0_30px_rgba(208,255,20,0.3)] hover:bg-[#b8e612] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(208,255,20,0.5)] inline-block"
          >
            For Merchants
          </Link>
          <Link
            href="/customer"
            className="border border-border bg-transparent text-text-primary px-10 py-4 font-medium text-[0.95rem] cursor-pointer rounded transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:text-accent inline-block"
          >
            For Customers
          </Link>
        </div>
      </div>
    </section>
  );
}
