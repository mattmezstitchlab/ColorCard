import React, { useEffect, useRef, useState } from "react";

export type GazeMode = "cursor" | "autonomous" | "fixed";

export interface EyeProps {
  className?: string;
  eyeWhite?: string;
  eyeColor?: string;
  pupilColor?: string;
  targetPoint?: { x: number; y: number } | null;
  forceBlink?: boolean;
  gazeMode?: GazeMode;
  isRightEye?: boolean;
  compact?: boolean;
}

export function Eye({
  className = "",
  eyeWhite,
  eyeColor = "#FBF0DC",
  pupilColor = "#000000",
  targetPoint = null,
  forceBlink = false,
  gazeMode = "cursor",
  compact = false,
}: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const effectiveWhite = eyeWhite || eyeColor || "#FBF0DC";

  // Natural micro-blink with random cadence
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 110);

      const nextInterval = 3200 + Math.random() * 4500;
      blinkTimer = setTimeout(triggerBlink, nextInterval);
    };

    const initialDelay = 1200 + Math.random() * 2500;
    blinkTimer = setTimeout(triggerBlink, initialDelay);

    return () => clearTimeout(blinkTimer);
  }, []);

  // Target positioning calculation based on exact geometry
  const updatePositionToPoint = (targetX: number, targetY: number) => {
    if (!eyeRef.current) return;
    const eye = eyeRef.current;
    const eyeRect = eye.getBoundingClientRect();
    if (eyeRect.width === 0 || eyeRect.height === 0) return;

    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;
    const dx = targetX - eyeCenterX;
    const dy = targetY - eyeCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const eyeRadius = eyeRect.width / 2;
    const pupilRadius = eyeRadius * 0.38;
    const maxMovement = Math.max(2, eyeRadius - pupilRadius - eyeRadius * 0.1);

    if (distance < 1) {
      setPupilPosition({ x: 0, y: 0 });
      return;
    }

    const nx = dx / distance;
    const ny = dy / distance;
    let moveX = Math.min(distance, maxMovement) * nx;
    let moveY = Math.min(distance, maxMovement) * ny;

    const totalDistance = Math.sqrt(moveX * moveX + moveY * moveY);
    if (totalDistance > maxMovement) {
      const scale = maxMovement / totalDistance;
      moveX *= scale;
      moveY *= scale;
    }

    setPupilPosition({ x: moveX, y: moveY });
  };

  // Autonomous wandering gaze effect
  useEffect(() => {
    if (gazeMode !== "autonomous") return;
    let wanderTimer: NodeJS.Timeout;

    const wander = () => {
      if (!eyeRef.current) return;
      const eye = eyeRef.current;
      const eyeRect = eye.getBoundingClientRect();
      const eyeRadius = eyeRect.width / 2;
      const pupilRadius = eyeRadius * 0.38;
      const maxMovement = Math.max(2, eyeRadius - pupilRadius - eyeRadius * 0.1);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxMovement;
      setPupilPosition({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });

      wanderTimer = setTimeout(wander, 1200 + Math.random() * 2000);
    };

    wander();
    return () => clearTimeout(wanderTimer);
  }, [gazeMode]);

  // Fixed frontal gaze
  useEffect(() => {
    if (gazeMode === "fixed") {
      setPupilPosition({ x: 0, y: 0 });
    }
  }, [gazeMode]);

  // Track targetPoint when specified
  useEffect(() => {
    if (targetPoint) {
      updatePositionToPoint(targetPoint.x, targetPoint.y);
    }
  }, [targetPoint]);

  // Cursor following tracking
  useEffect(() => {
    if (gazeMode !== "cursor" || targetPoint) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePositionToPoint(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [targetPoint, gazeMode]);

  return (
    <div
      ref={eyeRef}
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] transition-transform duration-75 ease-out ${
        compact
          ? "size-[64px] sm:size-[72px]"
          : "size-[104px] sm:size-[118px] md:size-[124px]"
      } ${className}`}
      style={{
        backgroundColor: effectiveWhite,
        transform: isBlinking || forceBlink ? "scaleY(0.06)" : "scaleY(1)",
        transformOrigin: "center",
      }}
      data-name="eye"
    >
      {/* Pupil with micro-highlight reflection */}
      <div
        className="absolute rounded-full transition-transform duration-75 ease-out shadow-sm"
        style={{
          width: "38%",
          height: "38%",
          backgroundColor: pupilColor,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        }}
      >
        {/* Subtle glossy catchlight */}
        <div className="absolute top-[18%] right-[22%] size-[22%] rounded-full bg-white/40 pointer-events-none" />
      </div>
    </div>
  );
}

export default Eye;
