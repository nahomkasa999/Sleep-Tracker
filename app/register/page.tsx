
'use client'

import { signIn } from '@/app/lib/auth-client';

export default function RegisterPage() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
          email: { value: string };
          password: { value: string };
        };
        // This is a basic example. You'll likely want to call a
        // server action to create the user first, then sign in.
        await signIn.social( {
          provider: "google",
        });
      }}
    >
      <label>
        Email
        <input name="email" type="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
      <button type="submit">Register</button>
    </form>
  );
}
