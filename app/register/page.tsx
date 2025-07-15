'use client'

import { authClient } from '@/app/lib/auth-client';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Corrected import

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Initialize useRouter hook

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await authClient.signUp.email({
      email: email,
      password: password,
      name: name,
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        },
        onError:() => {
          router.push("/error")
        }
      }
    });
    if (error) {
      setError(error.message!);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <input 
        type="text"
        placeholder='enter your name'
        value={name}
        onChange={(e) => setName(e.target.value)}
         />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
        {error && <p>{error}</p>}
      </form>
      <Link href="/login">Already have an account? Sign In</Link>
      <hr />
      <button onClick={() => authClient.signIn.social({ provider: 'google' })}>
        Sign up with Google
      </button>
    </div>
  );
}