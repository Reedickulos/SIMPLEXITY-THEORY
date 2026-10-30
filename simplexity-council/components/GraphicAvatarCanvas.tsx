import React, { useEffect, useRef, useState } from "react";
import { Participant } from "../types";
import { Sparkles, Activity, Layers, Disc } from "lucide-react";

interface GraphicAvatarCanvasProps {
  participant: Participant;
  isSpeaking: boolean;
  isMuted: boolean;
  currentStreamText?: string;
  avatarMode?: "graphic" | "hybrid" | "portrait";
  onToggleMode?: () => void;
}

export const GraphicAvatarCanvas: React.FC<GraphicAvatarCanvasProps> = ({
  participant,
  isSpeaking,
  isMuted,
  currentStreamText = "",
  avatarMode = "graphic",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLengthRef = useRef<number>(0);
  const energyRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageLoadedRef = useRef<boolean>(false);

  // Load avatar image for hybrid mode
  useEffect(() => {
    if (participant.avatarUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = participant.avatarUrl;
      img.onload = () => {
        imageRef.current = img;
        imageLoadedRef.current = true;
      };
    }
  }, [participant.avatarUrl]);

  // Track text updates to trigger audio energy spikes
  useEffect(() => {
    const currentLen = currentStreamText.length;
    if (currentLen > textLengthRef.current) {
      // Text is actively streaming! Inject energy spike proportional to incoming stream
      energyRef.current = Math.min(1.0, energyRef.current + 0.35);
    }
    textLengthRef.current = currentLen;
  }, [currentStreamText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Particle system for stream emissions
    const particles: Array<{
      x: number;
      y: number;
      angle: number;
      speed: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    const isUser = participant.id === "user";
    const primaryColor = isUser ? "#00ff88" : "#00f3ff";
    const secondaryColor = isUser ? "#00cc66" : "#7000ff";
    const glowRgb = isUser ? "0, 255, 136" : "0, 243, 255";

    const render = () => {
      time += 0.03;

      // Handle high-DPI scaling
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.26;

      ctx.clearRect(0, 0, width, height);

      // Energy decay & active speak baseline
      if (isSpeaking) {
        energyRef.current = Math.max(0.4, energyRef.current * 0.94);
      } else {
        energyRef.current = Math.max(0.05, energyRef.current * 0.92);
      }

      if (isMuted) {
        energyRef.current = 0;
      }

      const activeEnergy = energyRef.current;

      // --- 1. AMBIENT GRAPHIC CORE BACKGROUND GLOW ---
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * 1.8
      );
      bgGrad.addColorStop(0, `rgba(${glowRgb}, ${0.15 + activeEnergy * 0.25})`);
      bgGrad.addColorStop(0.6, `rgba(${glowRgb}, ${0.03 + activeEnergy * 0.08})`);
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. RADIAL AUDIO SPECTRUM BARS ---
      const barCount = 48;
      const minBarLen = 6;
      const maxBarLen = 38 * (0.3 + activeEnergy * 1.2);

      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2 + time * 0.2;
        const waveFreq = Math.sin(i * 0.4 + time * 3) * 0.5 + 0.5;
        const barLength = minBarLen + waveFreq * maxBarLen;

        const innerR = baseRadius + 4;
        const outerR = innerR + barLength;

        const x1 = centerX + Math.cos(angle) * innerR;
        const y1 = centerY + Math.sin(angle) * innerR;
        const x2 = centerX + Math.cos(angle) * outerR;
        const y2 = centerY + Math.sin(angle) * outerR;

        ctx.strokeStyle = `rgba(${glowRgb}, ${0.2 + waveFreq * 0.6 * (0.2 + activeEnergy)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // --- 3. ROTATING KINETIC ORBITAL RINGS ---
      // Outer ring with dashed ticks
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.4);
      ctx.strokeStyle = `rgba(${glowRgb}, ${0.3 + activeEnergy * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Counter-rotating inner ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-time * 0.6);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + activeEnergy * 0.3})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // --- 4. ORGANIC / GEOMETRIC CORE AVATAR ---
      if (avatarMode === "portrait" || (avatarMode === "hybrid" && imageLoadedRef.current && imageRef.current)) {
        // Render central circular masked photo portrait with graphic ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.clip();

        if (imageRef.current) {
          ctx.drawImage(
            imageRef.current,
            centerX - baseRadius,
            centerY - baseRadius,
            baseRadius * 2,
            baseRadius * 2
          );
        }

        // Overlay energetic color tint during streaming
        if (activeEnergy > 0.1) {
          ctx.fillStyle = `rgba(${glowRgb}, ${activeEnergy * 0.25})`;
          ctx.fillRect(centerX - baseRadius, centerY - baseRadius, baseRadius * 2, baseRadius * 2);
        }

        ctx.restore();

        // Glowing border around portrait
        ctx.strokeStyle = `rgba(${glowRgb}, ${0.6 + activeEnergy * 0.4})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // --- PURE GRAPHIC MOTION AVATAR (Liquid Plasma Core + Neural Mesh) ---
        ctx.beginPath();
        const points = 64;
        for (let i = 0; i <= points; i++) {
          const a = (i / points) * Math.PI * 2;
          // Fluid sine wave displacement
          const wave1 = Math.sin(a * 5 + time * 3.5) * (8 + activeEnergy * 18);
          const wave2 = Math.cos(a * 3 - time * 2) * (5 + activeEnergy * 12);
          const r = baseRadius + wave1 + wave2;

          const px = centerX + Math.cos(a) * r;
          const py = centerY + Math.sin(a) * r;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        const coreGrad = ctx.createRadialGradient(
          centerX - baseRadius * 0.3,
          centerY - baseRadius * 0.3,
          10,
          centerX,
          centerY,
          baseRadius * 1.2
        );
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.4, primaryColor);
        coreGrad.addColorStop(0.8, secondaryColor);
        coreGrad.addColorStop(1, "rgba(5, 5, 10, 0.95)");

        ctx.fillStyle = coreGrad;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 20 * (0.5 + activeEnergy);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Inner Cybernetic Constellation / Neural Nodes
        const nodeCount = 7;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + activeEnergy * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();

        const nodeCoords: Array<{ x: number; y: number }> = [];
        for (let n = 0; n < nodeCount; n++) {
          const nAngle = (n / nodeCount) * Math.PI * 2 + time * 0.5;
          const nRadius = baseRadius * 0.5 * (0.8 + Math.sin(time * 2 + n) * 0.2);
          const nx = centerX + Math.cos(nAngle) * nRadius;
          const ny = centerY + Math.sin(nAngle) * nRadius;
          nodeCoords.push({ x: nx, y: ny });

          if (n === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw node points
        nodeCoords.forEach((node) => {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.5 + activeEnergy * 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- 5. SPARK PARTICLES ON OUTPUT STREAM SPOKE ---
      if (activeEnergy > 0.15 && Math.random() < activeEnergy * 0.7) {
        const pAngle = Math.random() * Math.PI * 2;
        particles.push({
          x: centerX + Math.cos(pAngle) * baseRadius * 0.8,
          y: centerY + Math.sin(pAngle) * baseRadius * 0.8,
          angle: pAngle,
          speed: 1.5 + Math.random() * 3 * (1 + activeEnergy),
          size: 1.5 + Math.random() * 2.5,
          alpha: 1.0,
          life: 0,
          maxLife: 25 + Math.random() * 20,
          color: Math.random() > 0.3 ? primaryColor : "#ffffff",
        });
      }

      // Render and update particles
      for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
        const p = particles[pIdx];
        p.life++;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.alpha = 1 - p.life / p.maxLife;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life >= p.maxLife) {
          particles.splice(pIdx, 1);
        }
      }

      // Request next frame
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [participant.id, isSpeaking, isMuted, avatarMode]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-full h-full max-w-[320px] max-h-[320px] object-contain"
      />
    </div>
  );
};
