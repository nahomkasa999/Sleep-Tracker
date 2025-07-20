// components/navbar/NavbarWrapper.tsx
"use client";
import { usePathname } from "next/navigation";
import { BottomNav } from "./Navbar";
import { useSession } from "@/app/lib/auth-client";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  console.log("session", session);
  console.log("isPending", isPending);

  //Only show on these routes and if authenticated
  const showNavbar =
    (
      pathname === "/" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/analytics")
    );

  if (!showNavbar) return null;
  return <BottomNav />;
}
