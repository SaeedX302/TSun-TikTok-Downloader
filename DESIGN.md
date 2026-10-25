# Design notes

## Direction

The interface is built with Anthropic's **frontend-design** skill as the visual brief: make deliberate choices tied to the subject, use typography as structure, avoid templated gradients and decorative glass, and spend boldness in one place. Platform rules come from **Material 3** (Android) and the **Apple Human Interface Guidelines** (iOS).

The product is a utility people reach for immediately after copying a TikTok link. The design therefore optimises for one action — paste and get files — while still feeling at home on the device in hand.

## Three interface languages

| Platform | Metaphor | Key decisions |
| --- | --- | --- |
| Android | Material 3 application | Filled text field, tonal state layers, pill actions, 24dp cards, top app bar, navigation bar, sage tonal palette |
| iOS | Native iOS application | Large title, inset grouped lists, separators, system blue, native-style tab bar, SF system type, 12pt group radii |
| Desktop | Editorial field tool | Fixed workspace rail, Fraunces display type, Manrope UI type, ruled sections, specimen-style result sheet, warm paper and vermilion |

No interface uses `backdrop-filter`, translucent glass, blur, or gradient decoration. Surfaces are solid and hierarchy comes from type, rules, spacing and tonal colour.

## Tokens

### Desktop — Paper & Ink

- Paper `#F2EFE7`, surface `#FBFAF6`, ink `#17160F`
- Muted `#6D675B`, rule `#D7D0C1`, accent `#D94F2B`
- Dark: `#131210` / `#1B1A16` / `#F2EEE3` / `#FF6B45`

### Android — Material 3 Sage

- Primary `#356859`, on-primary `#FFFFFF`, primary container `#B9ECD7`
- Background `#F6F8F4`, surface `#FFFFFF`, surface variant `#E9EFE8`
- Dark: `#0F1410` / `#1A201B` / primary `#9FD3BE`

### iOS — System

- Tint `#0A84FF`, grouped background `#F2F2F7`, surface `#FFFFFF`
- Label `#000000`, secondary label `#6C6C70`, separator `rgba(60,60,67,.29)`
- Dark: `#000000` / `#1C1C1E` / `#0A84FF`

## Type

- Desktop display: **Fraunces** — a serif with a distinct optical size, used only for the page statement and result title.
- Desktop UI: **Manrope** — compact, readable, with tabular numeric stats.
- Android: Roboto / system sans.
- iOS: `-apple-system` / SF Pro.

## Motion

Only state feedback: press states, tab transitions, progress bars, spinner. No entrance animations, no floating decoration. `prefers-reduced-motion` is respected.

## Previewing

Add `?ui=android`, `?ui=ios`, or `?ui=web` to the URL on any desktop browser. Without a parameter the app detects the device user agent, including iPadOS.
