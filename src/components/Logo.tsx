import React from 'react';

const LOGO_SRC = "/renderdragon-logo.webp";

export const Logo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) => {
  const dimensions = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-14"
  }[size];

  return (
    <img
      src={LOGO_SRC}
      alt="Renderdragon"
      width={128}
      height={92}
      decoding="async"
      className={`${dimensions} w-auto object-contain ${className}`}
    />
  );
};

export default React.memo(Logo);
