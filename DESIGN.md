# Design System: VitalCare

## 1. Visual Theme & Atmosphere

Restrained, gallery-airy clinical interface. Premium and trustworthy without sterility. Prioritizes clarity, scanability, and calm over decoration. 

- **Density:** 5 - Balanced for data-dense health information
- **Variance:** 6 - Subtle asymmetry without visual chaos
- **Motion:** 4 - Restrained, purposeful transitions only

## 2. Color Palette & Roles

| Name | Hex | Role |
|---|---|---|
| Canvas | `#FFFFFF` | Primary background |
| Surface Subtle | `#FAFAFA` | Secondary backgrounds, tables, code blocks |
| Card Surface | `#FFFFFF` | Cards, modals, panels |
| Charcoal Ink | `#18181B` | Primary text, headings |
| Muted Steel | `#71717A` | Secondary text, metadata, labels |
| Tertiary Text | `#A1A1AA` | Placeholders, disabled states |
| Whisper Border | `#E5E5E5` | Dividers, card borders |
| Strong Border | `#D4D4D4` | Input borders, active states |
| Accent | `#18181B` | CTAs, active states, focus rings |

*No purple, neon, or saturated accents. Single accent color only.*

## 3. Typography Rules

| Element | Treatment |
|---|---|
| Display/Headings | Tight tracking (-0.022em), weight 600, scale via `clamp()` |
| Body | Weight 400-500, line-height 1.6, max-width 65ch |
| Labels/Metadata | Weight 500, size 12-13px, color Muted Steel |
| Monospace | JetBrains Mono for vitals, timestamps, metrics |

**Fonts:** Satoshi or Jost for display/body. JetBrains Mono for data. Inter is avoided. No generic serifs.

## 4. Component Stylings

| Component | Styling |
|---|---|
| Buttons | Height 36px, radius 6px, weight 500. Primary: solid accent. Ghost: transparent with hover background. No glows. |
| Cards | Border 1px Whisper Border, radius 8-12px. Minimal shadow. Used only when hierarchy requires it. |
| Inputs | Height 36px, radius 6px, label above input. Focus: border to Strong Border. |
| Lists/Tables | Border-top dividers over cards when dense. Generous padding. |
| Empty States | Composed with clear hierarchy, no decorative illustrations. |

## 5. Layout Principles

- **Grid-first:** CSS Grid over complex flexbox calculations
- **Containment:** Max-width 1400px with generous padding (24-32px)
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64px
- **Responsive:** Single column below 768px. No horizontal scroll.
- **No overlap:** Every element occupies its own spatial zone

## 6. Motion & Interaction

- **Easing:** Subtle, purposeful transitions (120-150ms)
- **Properties:** Animate only `transform` and `opacity`
- **Stagger:** Cascade delays for list reveals when appropriate
- **States:** Clear hover/focus/active states without scale transforms or glows

## 7. Anti-Patterns (Banned)

- No emojis anywhere
- No purple, neon, or oversaturated colors
- No gradients
- No glow shadows or drop shadows with color
- No pill-shaped buttons (use 6px radius)
- No 3-column equal card grids
- No centered hero sections with filler copy
- No AI clichés ("seamless", "elevate", "unlock", "revolutionize")
- No fake metrics, stats, or testimonials
- No fabricated data
- No custom cursors
- No overlapping elements
- No `h-screen` (use `min-h-[100dvh]`)
- No em dashes as decoration

## Implementation Notes

- Use CSS custom properties for tokens
- System fonts preferred for performance
- Respect `prefers-reduced-motion`
- Maintain WCAG contrast ratios
- Keep motion minimal and purposeful
