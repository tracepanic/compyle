"use client";

import { NavMain } from "@/components/custom/nav-main";
import { NavSecondary } from "@/components/custom/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ArrowUpRight,
  CornerUpLeft,
  House,
  MessageCircleMore,
  Settings,
  SquareTerminal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const data = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: House },
    { title: "Comments", url: "/dashboard/comments", icon: MessageCircleMore },
    {
      title: "Apps",
      url: "/dashboard/apps",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Your Apps",
          url: "/dashboard/apps",
        },
        {
          title: "Create App",
          url: "/dashboard/apps/new",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Profile",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Account",
          url: "/dashboard/settings/account",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "All Apps",
      url: "/apps",
      icon: CornerUpLeft,
    },
    {
      title: "Compyle.ai",
      url: "https://www.compyle.ai",
      icon: ArrowUpRight,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src="/compyle.svg"
                  width={35}
                  height={35}
                  alt="Compyle.ai logo"
                  className="object-contain"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Compyle Apps</span>
                  <span className="truncate text-xs">User Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
