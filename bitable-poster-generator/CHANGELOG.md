# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0.0] - 2026-03-18

### Added
- QR code placeholder type with text field binding and preview rendering
- Template sharing with team visibility (private/team) via tenant_key
- Batch ZIP download as alternative to writing attachments to table
- Smart field matching that auto-suggests bindings based on placeholder labels
- Placeholder locking to prevent accidental moves/resizes
- Template thumbnail generation for template list preview
- Vitest test framework with 48 unit tests across 6 test files

### Changed
- Refactored useCanvas.ts from 1219 to ~850 lines by extracting:
  - `useCanvasPreview.ts` — preview system (190 lines)
  - `canvasIO.ts` — serialization helpers (92 lines)
  - `imageFitting.ts` — unified cover/contain/circle logic (125 lines)
- Unified image fitting logic eliminates 3x code duplication across preview, poster generation, and canvas
- posterGenerator.ts now uses shared imageFitting utilities
- Template manager supports team/my tabs with visibility toggle
- Backend API supports team template listing and tenant_key storage

### Fixed
- QR code field binding dropdown showed image fields instead of text fields
- Removed dead `_placeholderType` parameter from field matcher
