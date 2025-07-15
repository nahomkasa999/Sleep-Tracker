
'use client'

import { authClient } from "../lib/auth-client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) {
      setError(error.message!);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignIn}>
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
        <button type="submit">Sign In</button>
        {error && <p>{error}</p>}
      </form>
      <Link href="/request-password-reset">Forgot Password?</Link>
      <hr />
      <button onClick={() => authClient.signIn.social({ provider: 'google' })}>
        Sign in with Google
      </button>
    </div>
  );
}
