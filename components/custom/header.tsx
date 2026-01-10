"use client";

import { ModeToggle } from "@/components/custom/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/session.store";
import { ArrowUpRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  const { authInfo, isInitialPending } = useAuthStore();

  return (
    <section className="py-4">
      <div className="container mx-auto px-6">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-16">
            <Link href="/" className="flex items-center gap-3 font-medium">
              <Image
                src="/compyle.svg"
                width={35}
                height={35}
                alt="Compyle.ai logo"
                className="object-contain"
              />
              <span className="font-semibold text-lg tracking-tighter">
                Compyle Apps
              </span>
            </Link>
            <div className="flex items-center h-full">
              <NavigationMenu>
                <NavigationMenuList className="flex gap-6 items-center">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/apps"
                        className="flex items-center h-full px-4"
                      >
                        Apps
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        target="_blank"
                        className="flex flex-row items-center gap-1 px-4"
                        href="https://www.compyle.ai"
                      >
                        Compyle.ai
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isInitialPending ? (
              <div className="flex gap-2">
                <Skeleton className="h-9 w-36 rounded-md" />
              </div>
            ) : !authInfo?.session ? (
              <div className="space-x-2">
                <Button className="py-3" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
            <ModeToggle />
          </div>
        </nav>

        {/* Mobile Menu */}
        <nav className="flex lg:hidden">
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-3 font-medium">
              <Image
                src="/compyle.svg"
                width={35}
                height={35}
                alt="Compyle.ai logo"
                className="object-contain"
              />
              <span className="font-semibold text-lg tracking-tighter">
                Compyle Apps
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Sheet modal={false}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center gap-3 font-medium">
                        <Image
                          src="/compyle.svg"
                          width={35}
                          height={35}
                          alt="Compyle.ai logo"
                          className="object-contain"
                        />
                        <span className="font-semibold text-lg tracking-tighter">
                          Compyle Apps
                        </span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mx-10 space-y-4">
                    <NavigationMenu>
                      <NavigationMenuList className="flex flex-col items-start">
                        <NavigationMenuItem>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/apps"
                              className="flex items-center h-full"
                            >
                              Apps
                            </Link>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                          <NavigationMenuLink asChild>
                            <Link
                              target="_blank"
                              className="flex flex-row items-center gap-1"
                              href="https://www.compyle.ai"
                            >
                              Compyle.ai
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                    {isInitialPending ? (
                      <div className="space-y-2">
                        <Skeleton className="h-9 w-full rounded-md" />
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    ) : !authInfo?.session ? (
                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link href="/login">Log in</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/signup">Sign up</Link>
                        </Button>
                      </div>
                    ) : (
                      <Button asChild size="sm" className="w-full">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <ModeToggle />
            </div>
          </div>
        </nav>
      </div>
      <Separator className="mt-3" />
    </section>
  );
}
