import React from "react";

interface TapsLogoProps {
  width: number;
  height: number;
}

function TapsLogo({ width = 32, height = 32 }: TapsLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`.pixel { shape-rendering: crispEdges; }`}</style>
      {/* Pint glass body */}
      <path className="pixel" d="M8 4h16v4l-2 20H10l-2-20z" fill="#FFB74D" />
      {/* Beer foam */}
      <path className="pixel" d="M10 6h12v4H10z" fill="#FFF9C4" />
      {/* Beer liquid */}
      <path className="pixel" d="M10 10h12v14H10z" fill="#FFC107" />
      {/* Pixel bubbles */}
      <circle className="pixel" cx="14" cy="14" r="1" fill="#FFE082" />
      <circle className="pixel" cx="18" cy="16" r="1" fill="#FFE082" />
      <circle className="pixel" cx="16" cy="18" r="1" fill="#FFE082" />
      {/* Highlight */}
      <path className="pixel" d="M12 8h2v2h-2z" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

export default TapsLogo;
