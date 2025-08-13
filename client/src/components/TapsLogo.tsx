import React from "react";

interface TapsLogoProps {
  width: number;
  height: number;
}

function TapsLogoSmooth({ width = 32, height = 32 }: TapsLogoProps) {
  const id = Math.random().toString(36).substring(7);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`beerGradient-${id}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#FFA000", stopOpacity: 1 }}
          />
        </linearGradient>
        <linearGradient
          id={`glassGradient-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            style={{ stopColor: "#FFFFFF", stopOpacity: 0.6 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#FFFFFF", stopOpacity: 0.1 }}
          />
        </linearGradient>
      </defs>
      {/* Glass body with smooth gradient */}
      <filter id={`shadow-${id}`}>
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
      </filter>
      <filter id={`glow-${id}`}>
        <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <path
        d="M8 4h16v4c0 0-3 20-3 20H11c0 0-3-20-3-20z"
        fill="#ECEFF1"
        stroke="#B0BEC5"
        strokeWidth="0.5"
        opacity="0.7"
        filter={`url(#shadow-${id})`}
      />
      {/* Beer liquid with gradient */}
      <path d="M10 10h12v14H10z" fill={`url(#beerGradient-${id})`} />
      {/* Foam with soft edges */}
      <path d="M10 6h12v4H10z" fill="#FFF9C4" opacity="0.9" />
      {/* Glass highlight */}
      <path
        d="M11 6c0 0 2 0 2 0v16c0 0-2 0-2 0z"
        fill={`url(#glassGradient-${id})`}
      />
      {/* Bubbles with subtle glow */}
      <g fill="#FFE082" opacity="0.8" filter={`url(#glow-${id})`}>
        <circle cx="14" cy="14" r="0.8">
          <animate
            attributeName="cy"
            from="14"
            to="12"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="18" cy="16" r="0.8">
          <animate
            attributeName="cy"
            from="16"
            to="14"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="16" cy="18" r="0.8">
          <animate
            attributeName="cy"
            from="18"
            to="16"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}

export default TapsLogoSmooth;
