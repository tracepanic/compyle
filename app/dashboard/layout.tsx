import { LayoutClient } from "@/app/dashboard/layout.client";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="m-2 ml-0 overflow-hidden rounded-xl shadow-sm">
        <header className="flex h-16 shrink-0 items-center gap-2 bg-background">
          <div className="flex items-center gap-2 px-4 border-b w-full pb-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumbs />
          </div>
        </header>
        <div className="gap-4 p-4 flex-1 overflow-auto container mx-auto">
          <LayoutClient>{children}</LayoutClient>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
