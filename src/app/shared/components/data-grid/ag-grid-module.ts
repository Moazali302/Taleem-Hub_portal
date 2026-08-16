import {
  ModuleRegistry,
  ClientSideRowModelModule,
  ValidationModule, // dev-only warnings; safe to keep, tree-shaken lightweight
  PaginationModule,
  CellStyleModule,
  CustomEditorModule,
  EventApiModule,
  RowSelectionModule,
  RowStyleModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
} from 'ag-grid-community';

/**
 * Registers only the AG Grid Community modules this app actually uses.
 * Replacing AllCommunityModule with a targeted list is the single biggest
 * bundle-size win available — AllCommunityModule pulls in charts,
 * sparklines, server-side row model, and other features we don't use.
 *
 * Call this exactly once — at the very top of main.ts, before
 * bootstrapApplication(...).
 */
export function registerAgGridModules(): void {
  ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PaginationModule,
    CellStyleModule,
    CustomEditorModule,
    EventApiModule,
    RowSelectionModule,
    RowStyleModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
  ]);
}