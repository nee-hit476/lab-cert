"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { JwtGen } from "@/lib/auth";
import SignIn from "@/app/auth/signin/page";

export default function ClientHome() {
  const { data: session } = useSession();

  const handleOnClick = async () => {
    const token = await JwtGen({ username: "Nishidh", role: "user" }, "7d");
    console.log(token);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <button onClick={handleOnClick} className="px-4 py-2 bg-blue-600 text-white rounded">
        Generate Token
      </button>

      {session ? (
        <div className="text-center">
          Signed in as {session.user?.name} <br />
          Email: {session.user?.email} <br />
          <button
            onClick={() => signOut()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="text-center">
          Not signed in <br />
          <button
            onClick={() => signIn()}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
}
