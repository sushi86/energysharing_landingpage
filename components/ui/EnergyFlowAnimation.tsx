"use client";

import { motion } from "framer-motion";

export function EnergyFlowAnimation() {
  return (
    <svg
      viewBox="0 0 600 280"
      className="w-full max-w-2xl"
      role="img"
      aria-label="Schaubild: Solarstrom fließt vom Haus mit Solaranlage zum Nachbarshaus und ins Netz"
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

      {/* House 1: solar producer */}
      <g>
        <polygon points="80,180 150,130 220,180" fill="var(--color-primary-dark)" />
        <rect x="90" y="180" width="120" height="70" fill="var(--color-primary-pale)" />
        <rect x="100" y="140" width="90" height="38" fill="#1e293b" transform="skewX(-30)" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={60 + i * 22}
            y={144}
            width={18}
            height={30}
            fill="#3b82f6"
            transform="skewX(-30)"
            opacity="0.85"
          />
        ))}
        <rect x="135" y="210" width="20" height="40" fill="var(--color-primary-dark)" />
      </g>

      {/* House 2: neighbor */}
      <g>
        <polygon points="340,180 410,130 480,180" fill="var(--color-primary-dark)" />
        <rect x="350" y="180" width="120" height="70" fill="var(--color-primary-pale)" />
        <rect x="395" y="210" width="20" height="40" fill="var(--color-primary-dark)" />
        <rect x="365" y="195" width="18" height="18" fill="#fef3e2" />
        <rect x="440" y="195" width="18" height="18" fill="#fef3e2" />
      </g>

      {/* Grid pylon */}
      <g>
        <line x1="550" y1="110" x2="550" y2="250" stroke="var(--color-muted)" strokeWidth="4" />
        <line x1="520" y1="140" x2="580" y2="140" stroke="var(--color-muted)" strokeWidth="4" />
        <line x1="525" y1="170" x2="575" y2="170" stroke="var(--color-muted)" strokeWidth="4" />
        <line x1="530" y1="200" x2="570" y2="200" stroke="var(--color-muted)" strokeWidth="4" />
      </g>

      {/* Particles */}
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          r="6"
          fill="var(--color-sun)"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            delay: i * 1,
          }}
          style={{
            offsetPath: "path('M 150 170 Q 280 100 410 170 Q 480 200 550 170')",
          }}
        />
      ))}
    </svg>
  );
}
