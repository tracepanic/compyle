export const DASHBOARD_BREADCRUMBS: Record<
  string,
  { label: string; href: string }[]
> = {
  "/dashboard": [{ label: "Dashboard", href: "/dashboard" }],

  "/dashboard/comments": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Comments", href: "/dashboard/comments" },
  ],

  "/dashboard/apps": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Apps", href: "/dashboard/apps" },
  ],

  "/dashboard/apps/new": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Apps", href: "/dashboard/apps" },
    { label: "Create App", href: "/dashboard/apps/new" },
  ],

  "/dashboard/apps/[id]": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Apps", href: "/dashboard/apps" },
    { label: "App Details", href: "/dashboard/apps/[id]" },
  ],

  "/dashboard/settings/account": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "Account", href: "/dashboard/settings/account" },
  ],

  "/dashboard/settings/profile": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "Profile", href: "/dashboard/settings/profile" },
  ],

  "/dashboard/apps/edit/[id]": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Apps", href: "/dashboard/apps" },
    { label: "Edit App", href: "/dashboard/apps/edit/[id]" },
  ],
};
