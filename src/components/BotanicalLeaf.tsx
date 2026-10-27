import React from 'react';

interface BotanicalProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Botanical leafy branch accent for horizontal cards
 * Placed behind or next to the service photo to match Image 1
 */
export function BotanicalSprig({ className, style }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Central curved botanical stem */}
      <path
        d="M15 105 C 35 85, 55 55, 95 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tip leaf */}
      <path
        d="M95 18 C 90 8, 75 10, 68 25 C 80 27, 90 22, 95 18 Z"
        fill="currentColor"
      />
      {/* Upper right leaf */}
      <path
        d="M75 35 C 88 28, 108 38, 102 54 C 88 53, 78 44, 75 35 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Upper left leaf */}
      <path
        d="M58 52 C 45 40, 26 48, 30 65 C 44 64, 54 56, 58 52 Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Mid right leaf */}
      <path
        d="M48 68 C 60 58, 80 66, 75 82 C 60 80, 52 73, 48 68 Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Lower left leaf */}
      <path
        d="M32 84 C 20 74, 5 80, 8 95 C 20 95, 28 88, 32 84 Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

/**
 * Botanical corner accent for the center featured card
 */
export function CenterLeafAccent({ className, style }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M10 150 Q 60 100 135 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M135 25 C 130 10, 105 12, 98 32 C 114 34, 128 28, 135 25 Z"
        fill="currentColor"
      />
      <path
        d="M108 48 C 125 38, 148 50, 140 72 C 122 70, 110 58, 108 48 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M84 72 C 65 56, 38 68, 45 90 C 64 88, 78 78, 84 72 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M68 96 C 85 82, 110 94, 104 116 C 84 112, 72 102, 68 96 Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M45 118 C 28 104, 8 112, 12 132 C 28 131, 38 123, 45 118 Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

/**
 * Delicate botanical outline watermark for subtle texture
 */
export function BotanicalWatermark({ className, style }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M30 230 C 50 170, 90 90, 170 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M170 30 C 160 12, 130 16, 120 42 C 142 45, 160 36, 170 30 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M132 64 C 158 52, 185 68, 175 96 C 150 94, 135 78, 132 64 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M102 96 C 76 76, 42 90, 52 120 C 78 116, 95 104, 102 96 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M82 130 C 106 112, 138 128, 130 158 C 104 152, 88 138, 82 130 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M54 162 C 32 144, 8 154, 14 180 C 34 178, 46 168, 54 162 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
