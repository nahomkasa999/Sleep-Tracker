"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      setError(error.message!);
  } else {
      setSuccess(true);
    }
  };

  return (
    <div>
      <h1>Request Password Reset</h1>
      {success ? (
        <p>Please check your email for a link to reset your password.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">Request Password Reset</button>
        </form>
      )}
    </div>
  );
}
