"use client";

import { motion } from "framer-motion";

export function EnergyFlowAnimation() {
  return (
    <svg
      viewBox="0 0 600 280"
      className="w-full max-w-2xl"
      role="img"
      aria-label="Schaubild: Solarstrom fließt vom Haus mit Solaranlage durch das Stromnetz zum Nachbarhaus und versorgt dort Wärmepumpe und Elektroauto; Überschuss geht ins öffentliche Netz."
    >
      {/* Sun */}
      <motion.g
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <circle cx="110" cy="60" r="28" fill="var(--color-sun)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 110 + Math.cos(rad) * 36;
          const y1 = 60 + Math.sin(rad) * 36;
          const x2 = 110 + Math.cos(rad) * 48;
          const y2 = 60 + Math.sin(rad) * 48;
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--color-sun)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </motion.g>

      {/* Ground line */}
      <line
        x1="0"
        y1="250"
        x2="600"
        y2="250"
        stroke="var(--color-muted)"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Underground cable (dashed) */}
      <line
        x1="30"
        y1="265"
        x2="573"
        y2="265"
        stroke="var(--color-muted)"
        strokeWidth="3"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />

      {/* House 1: solar producer */}
      <g>
        <polygon points="80,180 150,130 220,180" fill="var(--color-primary-dark)" />
        <rect x="90" y="180" width="120" height="70" fill="var(--color-primary-pale)" />
        <rect x="135" y="210" width="20" height="40" fill="var(--color-primary-dark)" />
        {/* House 1 stub to cable */}
        <line
          x1="150"
          y1="250"
          x2="150"
          y2="265"
          stroke="var(--color-muted)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* House 2: neighbor / consumer */}
      <g>
        <polygon points="310,180 380,130 450,180" fill="var(--color-primary-dark)" />
        <rect x="320" y="180" width="120" height="70" fill="var(--color-primary-pale)" />
        <rect x="365" y="210" width="20" height="40" fill="var(--color-primary-dark)" />
        <rect x="335" y="195" width="18" height="18" fill="#fef3e2" />
        <rect x="410" y="195" width="18" height="18" fill="#fef3e2" />
        {/* House 2 stub to cable */}
        <line
          x1="380"
          y1="250"
          x2="380"
          y2="265"
          stroke="var(--color-muted)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Grid marker (public grid exit) */}
      <g>
        <circle cx="585" cy="265" r="14" fill="var(--color-muted)" />
        <path
          d="M 587 258 L 581 266 L 585 266 L 583 272 L 589 264 L 585 264 Z"
          fill="var(--color-primary-pale)"
        />
      </g>
    </svg>
  );
}
