
'use client'

import { authClient } from "../lib/auth-client";



export default function LoginPage() {
  return (
   <button onClick={() => authClient.signIn.social({
      provider: "google", 
   })}>login</button>
  );
}
