// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { AuthHandler } from "@/lib/auth";
import { NextApiRequest } from "next";

// const handler = (req: NextApiRequest) => {
//   // If your AuthOptions need the request, you can pass it
//   return NextAuth(AuthHandler.AuthOptions());
// }

const handler = NextAuth(AuthHandler.AuthOptions())

export { handler as GET, handler as POST };
