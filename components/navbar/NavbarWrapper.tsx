// components/navbar/NavbarWrapper.tsx
"use client";
import { usePathname } from "next/navigation";
import { BottomNav } from "./Navbar";
import { useSession } from "@/app/lib/auth-client";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const showNavbar =
    (
      pathname === "/" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/analytics")
    );

  if (!showNavbar) return null;
  return <BottomNav />;
}
