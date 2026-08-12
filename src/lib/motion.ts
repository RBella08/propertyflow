// PropertyFlow 2026 — Animation System reference values.
//
// This file defines the exact Tailwind class strings the design
// specification calls for. Nothing in the app imports this yet — it
// exists so that when button.tsx, dialog.tsx, sheet.tsx,
// dropdown-menu.tsx, badge.tsx, and card.tsx are next updated, the
// values applied to them come from one verified, documented source
// instead of being improvised per-file.
//
// Do not apply these inside components until their current complete
// file contents have been verified, per the project's file-safety rule.

export const MOTION = {
  /**
   * Buttons: 150-200ms color/opacity transition, no hover scale.
   * A brief press-down on click only, never on hover.
   */
  button: 'transition-colors duration-150 active:scale-[0.98]',

  /**
   * Genuinely clickable cards only (e.g. a property card, a
   * conversation list item). Never apply to static/data-display cards.
   */
  clickableCard: 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card',

  /**
   * Status badges (lease status, payment status, maintenance status).
   * Subtle color crossfade only when a real-time value actually
   * changes — never a flash, bounce, or scale.
   */
  statusBadge: 'transition-colors duration-200',

  /**
   * Radix-driven dropdowns/popovers. Uses tailwindcss-animate's
   * data-state hooks. 300ms sits inside the spec's 300-400ms window
   * for both enter and exit.
   */
  dropdownEnterExit:
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300',

  /**
   * Modal / Dialog / Sheet overlays. Enter uses ease-out (responsive
   * feel), exit uses ease-in (intentional, not abrupt), both within
   * the 300-400ms window.
   */
  overlayEnter: 'duration-300 ease-out',
  overlayExit: 'duration-300 ease-in',

  /**
   * Expand/collapse chevron rotation, if/where an accordion-style
   * trigger exists.
   */
  chevronRotate: 'transition-transform duration-200',

  /**
   * Skeleton -> real content handoff. Per spec: ~150ms.
   */
  skeletonReveal: 'transition-opacity duration-150',

  /**
   * Copy-to-clipboard icon swap (icon -> checkmark), if/where a copy
   * action exists. Value is the display duration in ms before
   * reverting, not a CSS class.
   */
  copyConfirmDurationMs: 1500,
} as const;
