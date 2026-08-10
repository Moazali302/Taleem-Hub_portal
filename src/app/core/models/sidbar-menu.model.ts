export interface SidebarMenuItem {
  label: string;
  icon: string;
  /** Route segment relative to the role's basePath, e.g. 'dashboard', 'schools'. */
  route: string;
}

/** Optional call-to-action pinned at the bottom of the sidebar (e.g. "Add New School"). */
export interface SidebarFooterAction {
  label: string;
  icon: string;
  route: string;
}

export interface SidebarConfig {
  /** Root path for this role's routes, e.g. '/super-admin'. */
  basePath: string;
  /** Label shown under the logo, e.g. 'Super Admin'. */
  roleLabel: string;
  items: SidebarMenuItem[];
  footerAction?: SidebarFooterAction;
}