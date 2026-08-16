import { themeQuartz } from 'ag-grid-community';

/**
 * Compact table theme shared by every AG Grid instance in the app
 * (Schools, Tickets, etc.) — matches the app's existing card/border style
 * instead of AG Grid's default look.
 *
 * If a param below errors on build after an AG Grid version bump, check
 * https://www.ag-grid.com/theme-builder/ for the current param names —
 * the Theming API's param surface has shifted slightly across v33-36 minors.
 */
export const compactGridTheme = themeQuartz.withParams({
  spacing: 6,
  rowHeight: 48,
  headerHeight: 44,
  fontSize: 13,
  headerFontWeight: 600,
  headerTextColor: '#6b7280',
  borderColor: '#e5e7eb',
  oddRowBackgroundColor: '#ffffff',
  backgroundColor: '#ffffff',
  accentColor: '#0f2a5e',
  wrapperBorderRadius: 12,
});