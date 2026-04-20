# Energy Flow Animation Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `EnergyFlowAnimation` SVG so solar panels sit flush on the roof, energy flows through a visible underground cable between houses, and the consumer side shows a heat pump and EV charging.

**Architecture:** Single-file rewrite of `components/ui/EnergyFlowAnimation.tsx`. Pure SVG + existing `framer-motion`. `viewBox="0 0 600 280"` preserved. All geometry reasoned about in that coordinate space.

**Tech Stack:** Next.js 16, React 19, TypeScript, framer-motion 12.

**Verification:** This project has no test runner. Each task verifies via:
1. `pnpm tsc --noEmit` — TypeScript passes
2. `pnpm lint` — ESLint passes
3. `pnpm dev` → open `http://localhost:3000`, scroll to the ExplainerSection, confirm the animation renders as described in that task's "Expected visual" note

**Spec:** `docs/superpowers/specs/2026-04-20-energy-flow-animation-redesign-design.md`

**Coordinate system (reference for all tasks):**
- Sun: center (110, 60)
- Ground line: y = 250 (both house bodies end here)
- House 1 body: x=90..210, y=180..250; roof polygon (80,180)–(150,130)–(220,180); stub at x=150
- House 2 body: x=320..440, y=180..250; roof polygon (310,180)–(380,130)–(450,180); stub at x=380
- Heat pump: x=285..315, y=225..250, against House 2's left wall
- EV: body around x=460..530, y=215..245, wheels at y=250
- Underground cable: horizontal line at y=265, spans x=30..600
- Grid marker: circle at (585, 265), r=14

---

## File Structure

- Modify: `components/ui/EnergyFlowAnimation.tsx` (full rewrite of the SVG body; exported function signature unchanged)

No other files are touched. `ExplainerSection.tsx` imports the component by name and that stays the same.

---

## Task 1: Rebuild scene skeleton (ground, cable, houses, grid marker)

**Files:**
- Modify: `components/ui/EnergyFlowAnimation.tsx` (full rewrite)

This task lays down the new static geometry: sun, ground, underground cable, both houses at new positions, house-to-cable stubs, grid marker. Solar panels are temporarily omitted (Task 2 adds them). Heat pump and EV are omitted (Tasks 3 & 4). The old airborne particle path is removed; Task 5 adds the new flows.

Expected visual after this task: sun top-left, two green houses with dark roofs on a common baseline, a dashed grey cable below them running left-to-right, short vertical stubs from each house into the cable, and a small grey circle with a lightning icon at the right end of the cable. No animation yet except the sun's opacity pulse.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `components/ui/EnergyFlowAnimation.tsx` with:

```tsx
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
```

- [ ] **Step 2: Run type check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: no errors (unused `motion` import is fine — it's still used on the sun group).

- [ ] **Step 4: Visual check**

Run: `pnpm dev`
Open: `http://localhost:3000`
Scroll to the "Wie funktioniert Energy Sharing?" section.
Expected: sun pulses top-left; two green houses with dark roofs on a common baseline; a dashed grey line runs below them; short vertical connectors from each house into the dashed line; a small grey circle with a white lightning bolt sits at the right end of the dashed line. No solar panels, no heat pump, no EV yet, no flowing particles.

- [ ] **Step 5: Commit**

```bash
git add components/ui/EnergyFlowAnimation.tsx
git commit -m "refactor(animation): rebuild scene skeleton with underground cable"
```

---

## Task 2: Add solar panels flush on House 1 roof

**Files:**
- Modify: `components/ui/EnergyFlowAnimation.tsx`

The left roof slope of House 1 runs from (80, 180) to (150, 130), vector (70, -50), length ≈ 86.0, angle ≈ −35.54°. We place panels in a local coordinate group that is translated to the roof-left point and rotated to match the slope, so the panel rectangles sit along the roof's local x-axis.

Expected visual after this task: four blue panel cells on a dark backing board, lying flat and flush on the left slope of House 1's roof (no gap, no overhang).

- [ ] **Step 1: Add the solar panel group inside the House 1 `<g>` block**

Inside the House 1 group, **after** the door `<rect>` and **before** the stub `<line>`, insert:

```tsx
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
```

- [ ] **Step 2: Run type check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Visual check**

Reload `http://localhost:3000`.
Expected: a dark backing board with four blue cells lies flat on the left slope of House 1's roof, starting slightly above the roof's bottom-left corner and ending before the roof peak, with no visible gap between panel bottom and roof surface and no overhang past the roof edges.

If the panels appear misaligned, the issue is usually the rotation angle or the backing `y` offset. Confirm `rotate(-35.54)` and `y="-14"` on the backing rect. Do NOT change the roof polygon coordinates.

- [ ] **Step 5: Commit**

```bash
git add components/ui/EnergyFlowAnimation.tsx
git commit -m "fix(animation): align solar panels flush on house 1 roof slope"
```

---

## Task 3: Add heat pump next to House 2

**Files:**
- Modify: `components/ui/EnergyFlowAnimation.tsx`

The heat pump is a small grey box with a fan circle against the left wall of House 2. Three "heat wave" arcs above it animate their opacity in a staggered loop to convey operation.

Expected visual after this task: a small grey rounded box sits directly against the left wall of House 2, with a circular fan face, and 2–3 thin curved lines pulse gently above it.

- [ ] **Step 1: Add the heat pump group**

Insert the following **directly after** the House 2 closing `</g>` tag and **before** the Grid marker group:

```tsx
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
```

- [ ] **Step 2: Run type check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Visual check**

Reload `http://localhost:3000`.
Expected: a grey box with a pale fan circle sits against House 2's left wall, flush with the ground line. Three thin orange wavy lines rise from above the box, fading as they ascend, staggered so one is always visible.

- [ ] **Step 5: Commit**

```bash
git add components/ui/EnergyFlowAnimation.tsx
git commit -m "feat(animation): add heat pump with pulsing heat waves"
```

---

## Task 4: Add EV with charging cable next to House 2

**Files:**
- Modify: `components/ui/EnergyFlowAnimation.tsx`

Stylized car to the right of House 2, a charging cable curving from House 2's right wall to the car's charge port, and a small battery bar on the car roof whose fill animates from empty to full on a loop.

Expected visual after this task: a small dark car with two light-coloured windows and two wheels sits on the ground right of House 2. A thin cable curves from House 2's right wall down to the car's left side. A small battery-shaped bar on top of the car fills up over ~3 seconds then resets.

- [ ] **Step 1: Add the EV group**

Insert **directly after** the heat pump group and **before** the Grid marker group:

```tsx
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
```

- [ ] **Step 2: Run type check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Visual check**

Reload `http://localhost:3000`.
Expected: a small dark car with a cabin, two windows, and two wheels sits to the right of House 2 on the ground line. A thin grey cable curves from House 2's right wall down to the car. A small battery-shaped outline sits on the car roof; an orange fill bar grows from left to right inside it over ~3 seconds then resets.

- [ ] **Step 5: Commit**

```bash
git add components/ui/EnergyFlowAnimation.tsx
git commit -m "feat(animation): add EV with charging cable and battery indicator"
```

---

## Task 5: Rectilinear particle flows through the cable

**Files:**
- Modify: `components/ui/EnergyFlowAnimation.tsx`

Replace the old airborne particle arc with three rectilinear flows that travel along the cable:

- **Stream A** — solar roof → cable → heat pump (3 particles, 4s loop)
- **Stream B** — solar roof → cable → EV charge port (3 particles, 4s loop, offset from A)
- **Stream C** — solar roof → cable → grid marker (1 particle, 6s loop, represents surplus)

Additionally, the cable itself gets a subtle flow effect via an animated `strokeDashoffset` overlay, so energy is implied even between particle emissions.

**Path starting point** — the midpoint of the solar panels in absolute coordinates. Panel group origin (80, 180), rotated −35.54°. Panel-center in the local frame is (43, −7). Rotating and translating: absolute ≈ (108, 151). All particle paths start from `M 108 151`.

**Paths:**
- Stream A (heat pump): `M 108 151 L 150 250 L 150 265 L 300 265 L 300 240`
- Stream B (EV): `M 108 151 L 150 250 L 150 265 L 465 265 L 465 235`
- Stream C (grid): `M 108 151 L 150 250 L 150 265 L 585 265`

Expected visual after this task: small orange dots emerge from the solar panels, drop down through House 1 into the cable, travel along the cable, and exit upward into either the heat pump, the EV's left side, or further right into the grid marker. The cable itself shows a slow left-to-right "flow" pulse.

- [ ] **Step 1: Replace the stub in the underground-cable section with a layered cable (static dashed base + animated flow overlay)**

Replace the existing cable `<line>` element:

```tsx
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
```

with:

```tsx
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
```

- [ ] **Step 2: Add the three particle streams**

Insert the following **directly before** the closing `</svg>` tag (i.e., after the Grid marker group):

```tsx
      {/* Particle streams: solar roof → cable → consumers / grid */}
      {(
        [
          {
            path: "M 108 151 L 150 250 L 150 265 L 300 265 L 300 240",
            count: 3,
            duration: 4,
            delayBase: 0,
          },
          {
            path: "M 108 151 L 150 250 L 150 265 L 465 265 L 465 235",
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
```

- [ ] **Step 3: Run type check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Run lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Visual check**

Reload `http://localhost:3000`.
Expected:
- Orange dots emerge from the solar panels on House 1 and travel down inside House 1 (vertically through the body), turn 90° at the cable level, travel horizontally along the dashed cable, then turn up into either the heat pump, the EV's left side, or all the way to the grid marker.
- The cable itself shows a gentle orange flow pulse moving left to right.
- At any moment at least one particle is visible; none float through the air above the houses.

If particles don't appear, this is almost always `offsetPath` browser support — confirm in Chrome/Firefox latest. Safari sometimes needs `offsetPath` with a `CSS.supports('offset-path', 'path("M 0 0")')` check; note the issue but do not add fallbacks in this task (not in scope).

- [ ] **Step 6: Commit**

```bash
git add components/ui/EnergyFlowAnimation.tsx
git commit -m "feat(animation): rectilinear particle flows through underground cable"
```

---

## Task 6: Final visual polish and verification

**Files:**
- Modify: `components/ui/EnergyFlowAnimation.tsx` (only if polish is needed)

This task is a consolidated review and any minor polish (e.g., particle size, cable opacity, timing).

- [ ] **Step 1: Run the full verification suite**

Run: `pnpm tsc --noEmit && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 2: Visual acceptance check against spec**

Reload `http://localhost:3000` and confirm every item in the spec's "Acceptance" section:

- [ ] Solar panels visibly sit on the roof slope of House 1 with no gaps or overhang
- [ ] A continuous dashed underground cable is visible, connecting both houses and exiting toward a grid marker on the right
- [ ] Particles travel through the cable path (not through the air)
- [ ] Heat pump and EV are recognizable at a glance and visually connected to House 2
- [ ] `aria-label` reflects the new scene (mentions heat pump, EV, and surplus to grid)
- [ ] No new dependencies (check `git diff package.json` — should be empty)

- [ ] **Step 3: If any polish changes were needed, commit them**

```bash
git add components/ui/EnergyFlowAnimation.tsx
git commit -m "polish(animation): final visual tuning"
```

If no polish was needed, skip the commit.

- [ ] **Step 4: Optional — smoke-check the rest of the page**

Quickly scroll the full landing page to confirm no layout regressions in neighboring sections. Reason: the animation sits inside `ExplainerSection`, which constrains width via `max-w-2xl` — no layout escape expected, but worth 10 seconds of verification.

---

## Rollback

Each task is a single commit. If a task's visual check fails and can't be fixed within that task's scope, `git revert <commit>` and re-plan that task only.
