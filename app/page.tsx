import ClientHome from "@/components/clientHome";
import ClientSessionProvider from "@/components/ClientSessionProvider";

export default function Home() {
  return (
    <ClientSessionProvider>
      <ClientHome />
    </ClientSessionProvider>
  );
}
