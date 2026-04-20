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

      {/* Underground cable: dashed base + animated flow overlay */}
      <g>
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
        <motion.line
          x1="30"
          y1="265"
          x2="573"
          y2="265"
          stroke="var(--color-sun)"
          strokeWidth="3"
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity="0.4"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </g>

      {/* House 1: solar producer */}
      <g>
        <polygon points="80,180 150,130 220,180" fill="var(--color-primary-dark)" />
        <rect x="90" y="180" width="120" height="70" fill="var(--color-primary-pale)" />
        <rect x="135" y="210" width="20" height="40" fill="var(--color-primary-dark)" />
        {/* Solar panels on left roof slope.
            Roof slope: (80,180)→(150,130), length ~86, angle -35.54°.
            Local frame: x runs along slope (0..86), y is perpendicular (negative = above the roof surface). */}
        <g transform="translate(80 180) rotate(-35.54)">
          <rect x="4" y="-14" width="78" height="14" fill="#1e293b" />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={6 + i * 19}
              y={-12}
              width={17}
              height={10}
              fill="#3b82f6"
              opacity="0.9"
            />
          ))}
        </g>
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

      {/* Heat pump against House 2's left wall */}
      <g>
        <rect
          x="285"
          y="225"
          width="30"
          height="25"
          rx="2"
          fill="var(--color-muted)"
        />
        <circle cx="300" cy="237" r="8" fill="var(--color-primary-pale)" />
        <circle cx="300" cy="237" r="2" fill="var(--color-muted)" />
        {/* Heat waves */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M ${290 + i * 5} 220 q 2 -4 4 0 q 2 4 4 0`}
            stroke="var(--color-sun)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            animate={{ opacity: [0, 0.8, 0], y: [0, -6, -12] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
          />
        ))}
      </g>

      {/* EV charging next to House 2 */}
      <g>
        {/* Charging cable from house wall to car charge port */}
        <path
          d="M 440 232 Q 450 244 462 232"
          stroke="var(--color-muted)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Car body */}
        <rect
          x="460"
          y="225"
          width="70"
          height="18"
          rx="4"
          fill="var(--color-primary-dark)"
        />
        {/* Car cabin */}
        <path
          d="M 472 225 L 480 213 L 512 213 L 520 225 Z"
          fill="var(--color-primary-dark)"
        />
        {/* Windows */}
        <path
          d="M 478 223 L 483 215 L 495 215 L 495 223 Z"
          fill="var(--color-primary-pale)"
        />
        <path
          d="M 497 223 L 497 215 L 509 215 L 514 223 Z"
          fill="var(--color-primary-pale)"
        />
        {/* Wheels */}
        <circle cx="475" cy="245" r="6" fill="#1e293b" />
        <circle cx="515" cy="245" r="6" fill="#1e293b" />
        {/* Battery indicator on roof */}
        <rect
          x="483"
          y="207"
          width="24"
          height="5"
          rx="1"
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="1"
        />
        <rect x="508" y="208.5" width="1.5" height="2" fill="var(--color-muted)" />
        <motion.rect
          x="484"
          y="208"
          height="3"
          fill="var(--color-sun)"
          animate={{ width: [0, 22] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
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

      {/* Particle streams: solar roof → cable → consumers / grid */}
      {(
        [
          {
            path: "M 108 151 L 150 250 L 150 265 L 380 265 L 380 220 L 300 220 L 300 225",
            count: 3,
            duration: 4,
            delayBase: 0,
          },
          {
            path: "M 108 151 L 150 250 L 150 265 L 380 265 L 380 220 L 465 220 L 465 225",
            count: 3,
            duration: 4,
            delayBase: 0.6,
          },
          {
            path: "M 108 151 L 150 250 L 150 265 L 585 265",
            count: 1,
            duration: 6,
            delayBase: 2,
          },
        ] as const
      ).map((stream, streamIdx) =>
        Array.from({ length: stream.count }).map((_, i) => (
          <motion.circle
            key={`${streamIdx}-${i}`}
            r="5"
            fill="var(--color-sun)"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{
              duration: stream.duration,
              repeat: Infinity,
              ease: "linear",
              delay: stream.delayBase + (i * stream.duration) / stream.count,
            }}
            style={{
              offsetPath: `path('${stream.path}')`,
            }}
          />
        ))
      )}
    </svg>
  );
}
