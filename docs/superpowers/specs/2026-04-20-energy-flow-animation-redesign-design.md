# Energy Flow Animation — Redesign

## Motivation

The current `EnergyFlowAnimation` has two concrete problems:

1. **Solar panels are visually misaligned** with the roof of House 1. The skewed `<rect>` panels are drawn at x=60–126 while the roof polygon spans x=80–220 and slopes from (80,180) → (150,130). The panels float off the left edge of the roof instead of sitting on the slope.
2. **The energy path is abstract.** Particles travel on a free-floating airborne arc (`M 150 170 Q 280 100 410 170 Q 480 200 550 170`). Nothing in the picture represents the *existing* power grid that actually carries shared energy between neighbors — which is the core mental model EEG/energy-sharing relies on.

Additionally, the scene is abstract: two generic houses and a pylon don't convey *what the shared energy is used for*. Adding visible consumers (heat pump, EV) grounds the animation in everyday life.

## Scope

- Single file: `components/ui/EnergyFlowAnimation.tsx`
- Pure SVG + existing Framer Motion — no new dependencies
- Keep the existing `viewBox="0 0 600 280"` and the `role`/`aria-label` accessibility pattern (updated label text)

## Visual Design

### Layout

- **Ground line** at y≈250 as a subtle horizontal reference for both houses
- **House 1 (producer)** on the left, unchanged in overall form — but solar panels re-positioned so they sit flush on the roof slope (panels lie along the line from roof edge to peak, with skew matching the roof pitch)
- **House 2 (consumer)** roughly centered, shifted left from its current position to make room for the EV on the right
- **Heat pump** as a small unit tucked against the left side of House 2 (grey body, small fan-circle, 2–3 animated heat waves rising)
- **EV** as a stylized car to the right of House 2, connected via a charging cable that runs from the house wall to the car's charge port; small battery indicator with a pulsing/filling animation
- **Grid exit** on the far right: the underground cable continues off-screen toward a small "grid" marker (stylized substation/lightning icon with a short label or just an icon — no pylon)

### Underground cable

- Dashed horizontal line at y≈265 (below the ground line) representing the public LV grid
- Short vertical "house connection" stubs drop from each house down into the cable
- Cable extends past House 2 and the EV off the right edge into the grid icon, making clear the cable is part of the public network

### Particles (energy flow)

Particles follow a **rectilinear path** through the cable, not an airborne arc:

1. **Primary flow:** solar roof → down house-1 stub → along cable → up house-2 stub → into House 2 and onward to heat pump and EV (branch at House 2 so some particles end at the heat pump, some at the car)
2. **Surplus flow:** a secondary, less frequent particle continues past House 2 along the cable → out to the grid icon (shows "excess goes to the grid")
3. **Cable pulse:** a subtle stroke-dasharray shift on the cable itself, so flow is conveyed even between particle emissions

Timing: keep the current 4s loop feel; stagger particles so 1–2 are always in motion.

## Accessibility

Update `aria-label` to describe the new scene, e.g.:
> "Schaubild: Solarstrom fließt vom Haus mit Solaranlage durch das Stromnetz zum Nachbarhaus, versorgt dort Wärmepumpe und Elektroauto; Überschuss geht ins öffentliche Netz."

## Non-goals

- No interactivity (hover, click)
- No responsive layout changes beyond what the existing `max-w-2xl` container provides
- No new color tokens — reuse `--color-primary-dark`, `--color-primary-pale`, `--color-sun`, `--color-muted`, plus the existing `#1e293b` / `#3b82f6` / `#fef3e2` literals already in the file
- No changes to any other component or section

## Acceptance

- Solar panels visibly sit on the roof slope of House 1 with no gaps or overhang
- A continuous dashed underground cable is visible, connecting both houses and exiting toward a grid marker on the right
- Particles travel through the cable path (not through the air)
- Heat pump and EV are recognizable at a glance and visually connected to House 2
- `aria-label` updated to reflect the new scene
- No new dependencies; file remains a single client component
