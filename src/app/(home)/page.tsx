"use client";

import BrowserStream from "@/components/browser-stream";
import Chat from "@/components/chat";
import Navbar from "@/components/navbar";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function Home() {
  const { state } = useSidebar();

  return (
    <>
      <BrowserStream />
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col h-screen p-4",
        state === "expanded" ? "w-[30%]" : "w-1/2 mx-auto"
      )}
    >
      <Navbar />
      <Chat />
    </div>
  );
}
