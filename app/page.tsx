"use client"; // <--- Add this directive to make it a Client Component

import { redirect } from "next/navigation";
import { authClient } from "./lib/auth-client";
import { useSession } from "./lib/auth-client";

export default function HomePage() { 
  const { data: session, isPending } = useSession();

  if (isPending === true) {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <button onClick={() => authClient.signOut()}>Sign Out</button>
      <h1>Welcome, {session.user?.email}!</h1>
    </div>
  );
}