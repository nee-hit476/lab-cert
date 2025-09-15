"use client";

import { getProviders, signIn, signOut, useSession, ClientSafeProvider } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignInContent() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  if (!providers) return <p>Loading sign-in options...</p>;

  if (session) {
    return (
      <div>
        Signed in as {session.user?.name} <br />
        <button onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      {Object.values(providers).map((provider) => (
        <div key={provider.id}>
          <button onClick={() => signIn(provider.id, { callbackUrl: '/' })}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}
