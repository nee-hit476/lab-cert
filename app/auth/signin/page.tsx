"use client";

import { SessionProvider } from "next-auth/react";
import SignInContent from "./SignInContent";

export default function SignInPage() {
  return (
    <SessionProvider>
      <SignInContent />
    </SessionProvider>
  );
}
