'use client'

import { authClient } from '@/app/lib/auth-client';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setError(null);
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Registration successful!");
          router.push("/dashboard");
        },
        onError: () => {
          toast.error("Registration failed. Please try again.");
          router.push("/error");
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
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name", { required: true })} />
              {errors.name && <span className="text-red-500 text-sm">Name is required</span>}
            </div>
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
              <Input id="password" type="password" {...register("password", { required: true })} />
              {errors.password && <span className="text-red-500 text-sm">Password is required</span>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing Up..." : "Sign Up"}
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
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm">
            Already have an account? Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
