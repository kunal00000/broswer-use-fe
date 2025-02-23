"use client";

import Chat from "@/components/chat";
import Navbar from "@/components/navbar";
import { useSidebar } from "@/components/ui/sidebar";

export default function Home() {
  const { state } = useSidebar();

  return (
    <div
      className={`flex flex-col h-screen p-4 ${
        state === "expanded" ? "w-[30%]" : "w-full"
      }`}
    >
      <Navbar />
      <Chat />
    </div>
  );
}
