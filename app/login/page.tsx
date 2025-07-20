
'use client'

import { authClient } from "../lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setError(null);
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Login successful!");
          router.push("/dashboard");
        },
        onError: () => {
          toast.error("Login failed. Please try again.");
        }
      }
    });
    if (error) {
      setError(error.message!);
      toast.error(error.message!);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email", { required: true })}
              />
              {errors.email && <span className="text-red-500 text-sm">Email is required</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true })}
              />
              {errors.password && <span className="text-red-500 text-sm">Password is required</span>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => authClient.signIn.social({ provider: 'google' })}>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/register" className="text-sm">
            Don't have an account? Sign up
          </Link>
          <Link href="/request-password-reset" className="text-sm">
            Forgot Password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
