import React from "react";

export interface ModernIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// 1. Studio Logo Icon
export function StudioLogoIcon({ size = 18, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeWidth={1.5} />
    </svg>
  );
}

// 2. Eye Aperture Icon
export function EyeApertureIcon({ size = 16, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity={0.2} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 3. Kinetic Timeline Icon
export function KineticTimelineIcon({ size = 16, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18M3 12h18M3 18h18" strokeDasharray="2 3" strokeWidth={1.25} />
      <circle cx="7" cy="6" r="2.5" fill="currentColor" />
      <circle cx="16" cy="12" r="2.5" fill="currentColor" />
      <circle cx="11" cy="18" r="2.5" fill="currentColor" />
    </svg>
  );
}

// 4. Modern Geometric Clock
export function GeoClockIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

// 5. Modern Geometric Pin / Location
export function GeoPinIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" />
    </svg>
  );
}

// 6. Modern Geometric Euro / Currency
export function GeoCurrencyIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6.5A7.5 7.5 0 0 0 6.5 12a7.5 7.5 0 0 0 11.5 5.5M4 10h9M4 14h9" />
    </svg>
  );
}

// 7. Modern Geometric Phone / Contact
export function GeoPhoneIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18h2" strokeWidth={2.5} />
      <circle cx="12" cy="6" r="0.75" fill="currentColor" />
    </svg>
  );
}

// 8. Modern Geometric Sound / Music Waves (Saxophone / Live Band)
export function GeoSoundWaveIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12h2M7 8v8M11 4v16M15 7v10M19 9v6M23 12h-2" />
    </svg>
  );
}

// 9. Modern Geometric Camera / Visuals
export function GeoCameraIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 7h4l1.5-2.5h5L16 7h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="14" r="3.5" />
      <circle cx="17.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

// 10. Modern Geometric Ceremony / Arch / Rings
export function GeoArchIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 22V10a8 8 0 0 1 16 0v12M2 22h20M9 22v-8a3 3 0 0 1 6 0v8" />
    </svg>
  );
}

// 11. Modern Geometric Gastronomy / Tableware
export function GeoPlateIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" strokeDasharray="3 2" />
      <path d="M3 2v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2M5 8v14M21 2v9a2 2 0 0 1-2 2h-1V2" strokeWidth={1.5} />
    </svg>
  );
}

// 12. Modern Geometric Cake / Celebration
export function GeoCakeIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 15h16v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6ZM6 9h12v6H6zM8 4h8v5H8z" />
      <path d="M12 2v2" strokeWidth={2.5} />
    </svg>
  );
}

// 13. Modern Geometric DJ / Club / Laser
export function GeoLaserIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeWidth={1.5} />
    </svg>
  );
}

// 14. Modern Geometric Flower / Botanical
export function GeoBloomIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle cx="12" cy="6" r="3" />
      <circle cx="18" cy="12" r="3" />
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="12" r="3" />
    </svg>
  );
}

// 15. Modern Geometric Car / Cortège
export function GeoCarIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 15h16M3 11l2.5-6h13L21 11v6a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-6Z" />
      <circle cx="7" cy="17" r="1.5" fill="currentColor" />
      <circle cx="17" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 16. Modern Geometric Beauty / Stylist Mirror
export function GeoMirrorIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v7M8 19h8M10 7l4 4" strokeWidth={1.5} />
    </svg>
  );
}

// 17. Modern Geometric 3D Flip Icon
export function GeoFlipIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
    </svg>
  );
}

// 18. Modern Geometric Chat Bubble
export function GeoChatIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

// 19. Modern Geometric Plus
export function GeoPlusIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// 20. Modern Geometric Arrow Right
export function GeoArrowRightIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// 21. Modern Geometric Chevron Left
export function GeoChevronLeftIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

// 22. Modern Geometric Chevron Right
export function GeoChevronRightIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// 23. Modern Geometric Check
export function GeoCheckIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// 24. Modern Geometric Copy
export function GeoCopyIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="13" height="13" x="8" y="8" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// 25. Modern Geometric Trash
export function GeoTrashIcon({ size = 14, className = "" }: ModernIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
    </svg>
  );
}
