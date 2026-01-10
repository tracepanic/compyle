"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/session.store";
import { Bell, ChevronsUpDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NavUser() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const router = useRouter();
  const { authInfo, setAuthState } = useAuthStore();
  const { isMobile } = useSidebar();

  async function handleLogout() {
    setPending(true);

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signout successfull");
          router.push("/login");
          setPending(false);
          setAuthState({ authInfo: null });
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Something went wrong");
          setPending(false);
        },
      },
    });
  }

  if (!authInfo?.user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer" asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={authInfo.user.image || undefined}
                  alt={authInfo.user.name}
                />
                <AvatarFallback className="rounded-lg">
                  {getInitials(authInfo.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {authInfo.user.name}
                </span>
                <span className="truncate text-xs">{authInfo.user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={authInfo.user.image || undefined}
                    alt={authInfo.user.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(authInfo.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {authInfo.user.name}
                  </span>
                  <span className="truncate text-xs">
                    {authInfo.user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/notifications">
                <Bell /> Notifications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout of your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    disabled={pending}
                    className="w-full sm:w-40 cursor-pointer gap-2"
                  >
                    {pending && <Spinner />}
                    {pending ? "Loading..." : "Logout"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
