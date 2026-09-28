
import { useEffect, useRef, useState } from "react";

interface EyeProps {
  className?: string;
  isRightEye?: boolean;
  eyeColor?: string;
  pupilColor?: string;
}

export function Eye({
  className = "",
  isRightEye = false,
  eyeColor = "#FBF0DC",
  pupilColor = "#000000",
}: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });

  const defaultPosition = { x: 0, y: 0 };

  useEffect(() => {
    setPupilPosition(defaultPosition);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const eye = eyeRef.current;
      const eyeRect = eye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;
      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const eyeRadius = eyeRect.width / 2;
      const pupilRadius = eyeRect.width * 0.18;
      const maxMovement = eyeRadius - pupilRadius - 5;

      if (distance < 1) {
        setPupilPosition({ x: defaultPosition.x, y: defaultPosition.y });
        return;
      }

      const nx = dx / distance;
      const ny = dy / distance;
      let moveX = Math.min(distance, maxMovement) * nx + defaultPosition.x;
      let moveY = Math.min(distance, maxMovement) * ny + defaultPosition.y;

      const totalDistance = Math.sqrt(
        Math.pow(moveX - defaultPosition.x, 2) +
        Math.pow(moveY - defaultPosition.y, 2)
      );

      if (totalDistance > maxMovement) {
        const scale = maxMovement / totalDistance;
        moveX = defaultPosition.x + (moveX - defaultPosition.x) * scale;
        moveY = defaultPosition.y + (moveY - defaultPosition.y) * scale;
      }

      setPupilPosition({ x: moveX, y: moveY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={eyeRef}
      className={`relative shrink-0 size-[124px] rounded-full overflow-hidden ${className}`}
      style={{ backgroundColor: eyeColor }}
      data-name="eye"
    >
      <div
        className="absolute rounded-full size-[46px]"
        style={{
          backgroundColor: pupilColor,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        }}
      />
    </div>
  );
}
