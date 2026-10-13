---
name: Cognitive Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system is engineered for deep focus, intellectual momentum, and high-stakes academic preparation. Catering to self-directed university students, researchers, and rigorous exam test-takers, the visual ethos balances the analytical clarity of an elite developer IDE with the inviting cadence of modern productivity suites.

The core aesthetic blends **Structured Precision** with **Atmospheric Glassmorphism**:
- **Cognitive Clarity:** Dense visual noise is eliminated. High-value data—such as mastery metrics, recall intervals, and knowledge graphs—is foregrounded through crisp spatial segmentation.
- **Controlled Focus:** Interfaces rely on balanced slate backdrops, micro-borders with subtle light reflections, and vivid spectral accents that guide the eye directly to action items, retention vulnerabilities, and active study pathways.
- **Calibrated Feedback:** Success states reflect immediate, tangible reward (emerald), while revision prompts and diagnostic weaknesses evoke urgency without anxiety (warm amber and rose).

## Colors

The system uses a dark-first foundation designed to sustain prolonged study sessions without retinal fatigue. High-contrast semantic accents establish immediate visual priority across study modules and analytical dashboards.

### Palette Architecture
- **Primary (`#6366F1` Indigo / `#4F46E5` Deep Violet):** The focal anchor. Applied to primary CTAs, active active node states, progress cursors, and active focus boundaries.
- **Secondary (`#10B981` Emerald):** Represents mastery, high recall confidence, streak milestones, and positive delta values.
- **Tertiary (`#F59E0B` Amber / `#F43F5E` Rose Alert):** Pinpoints weak conceptual links, spaced repetition review queues, and impending exam dates.
- **Neutrals (`#0F172A` Canvas, `#1E293B` Surface Tier 1, `#334155` Surface Tier 2, `#F8FAFC` Primary Text):** Construct the deep slate tonal foundation, allowing glowing accents to retain high signal-to-noise ratio.
- **Subtle Glass Fills:** Semi-translucent layers (`rgba(30, 41, 59, 0.7)`) preserve ambient context behind modals, popovers, and floating study docks.

## Typography

The typographic hierarchy pairs the contemporary geometric clarity of **Plus Jakarta Sans** for headlines with the neutral legibility of **Inter** for dense reading, flashcards, and summary breakdowns. Technical readouts, time counters, accuracy ratios, and metadata tags invoke **JetBrains Mono** to reinforce an analytical, high-reliability tone.

### Usage Principles
- **Headlines:** Use tighter letter-spacing to present punchy, authoritative module headers and metric highlights.
- **Reading Passages:** Maintain generous line height (`1.6x` font size) on long-form content to optimize reading speed and visual anchor points during study marathons.
- **Data & Tags:** Render spaced-repetition intervals (e.g., `NEXT: 4d`, `ACC: 94.2%`) strictly in the monospaced label style to ensure visual alignment in stacked layouts.

## Layout & Spacing

The structural layout relies on an adaptable 12-column grid system designed around content modularity (card blocks, session timelines, analytical graphs, and study splits).

### Grid & Breakpoints
- **Desktop (1280px+):** 12-column fluid grid, 2rem margins, 1.5rem gutters. Supports multi-pane configurations: contextual sidebar (navigation & syllabus), central active study canvas, and collapsible analytical telemetry.
- **Tablet (768px – 1279px):** 8-column layout, 1.5rem margins, 1rem gutters. Sidebars fold into an expandable drawer or bottom-docked control deck.
- **Mobile (< 768px):** 4-column layout, 1rem margin, 1rem gutter. Content stacks vertically into high-focus individual study cards. Bottom-fixed action bars replace floating interaction controls.

### Spacing Rhythm
Spatial increments enforce an 8-point base rhythm, scaling down to 4px for tight internal component paddings (`space-xs`). Layout clusters group related knowledge topics tightly (`space-sm` to `space-md`) while separating distinct modules and review steps with generous intervals (`space-xl`).

## Elevation & Depth

Depth is established primarily through **luminous surface layering and translucent glass containment**, avoiding dark, muddy drop-shadows.

### Surface Tiers
- **Base Canvas (`#0F172A`):** The foundational workspace. Absolute black is avoided to prevent high-contrast eye fatigue.
- **Container Level 1 (`#1E293B`, 80% opacity with `backdrop-filter: blur(16px)`):** Standard resting containers, study deck cards, and navigation shelves.
- **Container Level 2 (`#334155`, 60% opacity with `backdrop-filter: blur(20px)`):** Hovered cards, active flashcard faces, popovers, and dropdown menus.
- **Modal / Overlay Layer (`rgba(15, 23, 42, 0.85)` + blur):** Isolates quiz sessions and timed simulation modes completely from backdrop distraction.

### Border & Illumination Rules
- Surfaces incorporate a crisp `1px` translucent border (`rgba(255, 255, 255, 0.08)` on neutral containers; `rgba(99, 102, 241, 0.3)` on active/focused states).
- Elevated states employ an **ambient directional violet/indigo glow** (`0 8px 32px -4px rgba(99, 102, 241, 0.15)`) instead of traditional drop shadows, evoking an activated, high-tech instrument.

## Shapes

The design system adopts a balanced geometry (`roundedness: 2` / base `0.5rem` / 8px). This choice strikes an intentional balance: soft enough to feel inviting during high-stress study loads, but sufficiently crisp and structured to prevent casual, toy-like perceptions.

- **Micro Components (0.375rem / 6px):** Badges, input toggles, and mono-data tags.
- **Standard Controls (0.5rem / 8px):** Buttons, text inputs, split-selectors, flashcard interaction bars.
- **Structural Surfaces (1rem / 16px):** Study cards, interactive graph viewports, deck overview tiles.
- **Prominent Shells (1.5rem / 24px):** Active exam modal dialogues, focused flashcard frames, and workspace hero banners.

## Components

### Buttons
- **Primary:** Gradient-infused solid fill (`#6366F1` to `#4F46E5`), white label, crisp 1px highlight along the upper border edge (`rgba(255, 255, 255, 0.2)`). Hover initiates a soft violet ambient bloom.
- **Secondary / Glass:** Semi-transparent slate (`rgba(30, 41, 59, 0.6)`), 1px border (`rgba(255, 255, 255, 0.1)`), light indigo or white text.
- **Destructive / Weakness Trigger:** Transparent background with `#F43F5E` micro-border and muted red font.

### Chips & Badges
- Built with `label-md` or `label-sm` monospaced type, 4px vertical / 8px horizontal padding.
- Semantic tints indicate topic mastery:
  - **Mastered:** Emerald background (`rgba(16, 185, 129, 0.12)`), emerald text, 1px emerald border (`rgba(16, 185, 129, 0.25)`).
  - **Needs Review:** Amber background (`rgba(245, 158, 11, 0.12)`), amber text, 1px amber border.
  - **Critical Gap:** Rose background (`rgba(244, 63, 94, 0.12)`), rose text, 1px rose border.

### Study Cards & Metric Containers
- Constructed on Level 1 Glass (`#1E293B`, 80% opacity) with a subtle upper border gradient mimicking top-down directional illumination.
- Display structured layouts: Header with module icon and category chip, body containing core study prompt or metric graph, and a footer featuring spaced-repetition indicators and completion rates.

### Form Inputs & Prompts
- Dark slate backdrops (`rgba(15, 23, 42, 0.6)`) with `1px` borders (`rgba(255, 255, 255, 0.12)`).
- On focus: Border transitions cleanly to `#6366F1`, supported by an outer `0 0 0 3px rgba(99, 102, 241, 0.2)` halo.
- Floating AI query fields include an integrated trailing micro-button for immediate model submission.

### Checkboxes & Selection Controls
- Square with 4px rounding. Inactive state features a muted slate stroke.
- Checked state features `#6366F1` background with an emerald check indicator or high-contrast white glyph.

### Specialized Study Components
- **Flashcard Stage:** Generous padding (`space-xl`), crisp double-sided perspective toggle, subtle top glow indicating difficulty rank.
- **Mastery Progress Trackers:** 6px rounded linear tracks (`#1E293B`) filled with segmented, glow-accented gradients moving from Amber (learning) through Indigo (retaining) to Emerald (mastered).