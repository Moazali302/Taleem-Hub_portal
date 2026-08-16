import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

/**
 * Registers every AG Grid Community module once at app bootstrap.
 * Call this exactly once — at the very top of main.ts, before
 * bootstrapApplication(...). Safe to call more than once (ModuleRegistry
 * dedups internally), but one call site keeps intent clear.
 */
export function registerAgGridModules(): void {
  ModuleRegistry.registerModules([AllCommunityModule]);
}