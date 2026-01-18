---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

---

## PROJECT DESIGN SYSTEM (MANDATORY)

**This project uses a neo-brutalist design system. ALL frontend code MUST follow these rules.**

### Theme File

Import and use the theme from `styles/theme.css`. All CSS variables are defined there.

### Core Principles

| Rule           | Value                                            | Rationale                                           |
| -------------- | ------------------------------------------------ | --------------------------------------------------- |
| Border radius  | `0rem`                                           | Sharp corners only. Never rounded.                  |
| Shadows        | None                                             | Flat design. No drop shadows, box shadows, or blur. |
| Primary colors | Black `#000000`, White `#ffffff`, Gold `#f7da50` | High contrast, minimal palette.                     |
| Borders        | Hard 1px black                                   | Define containers with lines, not shadows.          |

### Typography

- **UI text**: `DM Sans` - clean, humanist sans-serif
- **Code/system/timestamps**: `Space Mono` - technical, monospace
- Never use: Inter, Roboto, Arial, system fonts, or other generic choices

### Color Usage

```
Light mode:
- Background: #ffffff (white)
- Foreground/text: #000000 (black)
- Primary action: #000000 (black)
- Accent/highlight: #f7da50 (gold)

Dark mode:
- Background: #000000 (black)
- Foreground/text: #ffffff (white)
- Primary action: #f7da50 (gold)
- Accent: #ffffff (white)
```

The gold `#f7da50` is the "hero" accent. Use it sparingly for:

- Active states
- Important highlights
- Call-to-action buttons
- Progress indicators
- Selected items

### Visual Language

The logo uses **tangram-style geometric shapes** (triangles, parallelograms). Extend this motif:

- Loading animations: geometric pieces assembling
- Section dividers: angular lines
- Decorative elements: triangle patterns
- Progress indicators: modular blocks

### Interactions & Motion

- Prefer **instant state changes** over smooth transitions
- When using animation, make it **sharp and deliberate**
- Hover states: instant color flip (black ↔ gold), not fade
- No bounce, no spring physics, no gradual easing

### MANDATORY DON'Ts

- ❌ No rounded corners (`border-radius` must be 0)
- ❌ No shadows (no `box-shadow`, no `drop-shadow`, no blur)
- ❌ No gradients
- ❌ No blur effects (`backdrop-filter: blur`, etc.)
- ❌ No colors outside the palette (no grays except `--muted-foreground`)
- ❌ No generic fonts (Inter, Roboto, Arial)
- ❌ No soft/smooth transitions (no `ease-in-out` on colors)

### MANDATORY DO's

- ✅ Use CSS variables from `styles/theme.css`
- ✅ Sharp 90° corners everywhere
- ✅ Hard 1px borders to define space
- ✅ High contrast (black on white, white on black)
- ✅ Gold for emphasis and active states
- ✅ DM Sans for body, Space Mono for code
- ✅ Flat, poster-like aesthetic
- ✅ Geometric/angular decorative elements

---

## General Design Thinking

Beyond the mandatory project rules above, consider:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What detail will make this memorable within the design system?

Implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking within the brutalist constraints
- Cohesive with the established design system
- Meticulously refined in every detail

## Frontend Implementation Guidelines

Focus on:

- **Typography**: Use DM Sans and Space Mono as specified. Create hierarchy through weight, size, and spacing—not font variety.
- **Color & Theme**: Use CSS variables from `styles/theme.css`. The black/white/gold palette is non-negotiable.
- **Motion**: Use animations sparingly. When used, make them sharp and immediate. CSS-only preferred. Focus on high-impact moments with instant reveals rather than gradual fades.
- **Spatial Composition**: Use bold layouts with generous negative space. Asymmetry and grid-breaking work well. Angular dividers and geometric motifs reinforce the brand.
- **Backgrounds & Visual Details**: Solid colors only. Add interest through borders, geometric patterns, and angular shapes—not gradients or textures.

**IMPORTANT**: This is a refined brutalist aesthetic. Elegance comes from restraint, precision, and perfect execution of simple elements. Every pixel matters when there's nowhere to hide.

Remember: The constraint of the design system IS the creative challenge. Find beauty in the sharp corners and bold contrasts.
