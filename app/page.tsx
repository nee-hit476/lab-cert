"use client";
import { JwtGen } from "@/lib/auth";
export default function Home() {

  const handleOnClick = async () => {
    const token = await JwtGen({
      username: "Nishidh",
      role: "user"
    }, "7d")

    console.log(token);
  }

  return (
    <div className="h-screen w-screen">
      <button onClick={() => handleOnClick()}>Generate Token</button>
    </div>
  );
}
