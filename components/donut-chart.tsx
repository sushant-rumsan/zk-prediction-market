"use client";

import { useEffect, useRef } from "react";

interface DonutChartProps {
  yesPercentage: number;
  noPercentage: number;
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({
  yesPercentage,
  noPercentage,
  size = 60,
  strokeWidth = 6,
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // Scale all drawing operations
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - strokeWidth) / 2;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#f3f4f6"; // gray-100
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Draw "No" segment (red)
    if (noPercentage > 0) {
      const noAngle = (noPercentage / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + noAngle);
      ctx.strokeStyle = "#ef4444"; // red-500
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }

    // Draw "Yes" segment (green)
    if (yesPercentage > 0) {
      const yesAngle = (yesPercentage / 100) * 2 * Math.PI;
      const startAngle = -Math.PI / 2 + (noPercentage / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + yesAngle);
      ctx.strokeStyle = "#10b981"; // green-500
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }

    // Draw center circle (white)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - strokeWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw text in center
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111827"; // gray-900
    ctx.fillText(`${Math.round(yesPercentage)}%`, centerX, centerY);
  }, [yesPercentage, noPercentage, size, strokeWidth]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="inline-block"
    />
  );
}
