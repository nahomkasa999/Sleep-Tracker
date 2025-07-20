"use client";

import { redirect } from "next/navigation";
import { authClient } from "./lib/auth-client";
import { useSession } from "./lib/auth-client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function HomePage() { 
  const { data: session, isPending } = useSession();

  if (isPending === true) {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/register");
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-2 border-border shadow-lg bg-card text-foreground">
        <CardHeader className="flex flex-col items-center gap-2">
          <User className="h-16 w-16 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-center">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold">{session.user?.name || "No Name"}</div>
          <div className="text-muted-foreground text-sm">{session.user?.email}</div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <Button
            variant="destructive"
            className="w-full max-w-xs"
            onClick={() => authClient.signOut()}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}