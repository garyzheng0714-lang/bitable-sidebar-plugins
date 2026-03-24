# Design System — f展 加密助手

## Product Context
- **What this is:** A Feishu Bitable sidebar plugin that encrypts/encodes field values (MD5, SHA-1, SHA-256, SHA-512, SM3, Base64, HMAC-SHA256) and writes results to a target field
- **Who it's for:** Data operators who need to batch-encrypt/hash/encode table field values inside Feishu
- **Space/industry:** Enterprise productivity tools, Feishu/Lark plugin ecosystem
- **Project type:** Narrow sidebar plugin (~410px), utility tool

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian — function-first, clean tool feel
- **Decoration level:** Minimal — spacing and brand color accents do all the work. No card containers, no shadows, no decorative elements.
- **Mood:** Professional and efficient. Like a well-made power tool — it does one thing fast and you trust it. The f展 blue+gold injects enough personality to not feel generic without overwhelming the utility.
- **Key insight:** This plugin runs INSIDE Feishu. It should feel like a native extension, not a foreign app. Typography matches the host; brand colors carry the differentiation.

## Typography
- **System font stack:** `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif`
- **Rationale:** Matches Feishu host app. Zero load time, zero visual dissonance.
- **Mono (data/hashes):** `"SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Mono", monospace`
- **Scale:**
  - Title: 16px / weight 700 / color primary
  - Label: 12px / weight 600 / color text-secondary
  - Body: 14px / weight 400 / color text-primary
  - Caption: 11px / weight 400 / color text-tertiary
  - Mono: 13px / weight 400 / for MD5 hash display

## Color
- **Approach:** Restrained — anchored to f展 brand, color is functional not decorative
- **Primary:** `#1677FF` — all interactive elements, links, focus states
- **Primary Hover:** `#0A5FD4`
- **Accent (Gold):** `#FFC300` — brand identity, progress bar highlight, header divider, output field dot
- **Text Primary:** `#1F2329`
- **Text Secondary:** `#646A73`
- **Text Tertiary:** `#8F959E`
- **Text Disabled:** `#BDC0C5`
- **Background Page:** `#FFFFFF`
- **Background Surface:** `#F7F8FA`
- **Border:** `#E5E8EB`
- **Border Light:** `#F0F1F2`
- **Divider:** `#EDEEF0`
- **Semantic:**
  - Success: `#34C724` / bg `#F0FAF0`
  - Error: `#F53F3F` / bg `#FFF2F0`
  - Warning: `#FF7D00` / bg `#FFF7E8`
  - Info: `#1677FF` / bg `#F0F6FF`
- **Dark mode strategy:** Reduce saturation 10-20%, flip neutrals, lighten primary to `#4D94FF`, accent to `#FFD54F`. See preview page CSS for full dark token set.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — tight enough for sidebar efficiency, not cramped
- **Scale:** xs(4) sm(8) md(12) base(16) lg(24) xl(32) 2xl(48)

## Layout
- **Approach:** Single-column vertical flow (sidebar-native)
- **Max width:** Determined by Feishu sidebar panel (~410px resizable)
- **Controls:** Full-width. No side-by-side form fields.
- **Border radius:**
  - sm: 4px (small elements, dots)
  - md: 8px (inputs, dropdowns, alerts, swatches)
  - lg: 12px (main containers, plugin frame)
  - button: 10px

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Easing:** enter/dropdown: ease-out | exit: ease-in | move: ease-in-out
- **Duration:**
  - Micro (border-color, hover): 120-150ms
  - Short (dropdown open, focus ring): 150ms
  - Medium (progress bar): 300ms
- **No bouncy, no spring, no stagger.** This is a utility, not a consumer app.

## Brand-specific Patterns
- **Progress bar:** Solid `#1677FF` — clean, matches primary action color. No gradient.
- **Header divider:** 2px solid `#FFC300` — consistent brand anchor
- **Input field dot:** Blue `#1677FF` for input, Gold `#FFC300` for output
- **Button gradient:** `linear-gradient(135deg, #1677FF, #0A5FD4)` with `box-shadow: 0 2px 8px rgba(22,119,255,0.3)`

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Initial design system created | Created by /design-consultation. Researched Feishu plugin ecosystem, Semi Design conventions, sidebar UX best practices. Anchored to f展 brand colors. |
| 2026-03-24 | System font stack, no custom fonts | Plugin runs inside Feishu — custom fonts would clash with host app typography |
| 2026-03-24 | Zero card containers, spacing-only separation | More professional tool feel, less form-wizard. Unique among Feishu plugins. |
| 2026-03-24 | Solid blue progress bar | User feedback: gradient looked cheap. Solid #1677FF is cleaner. |
