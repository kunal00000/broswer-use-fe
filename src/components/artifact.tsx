"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function ArtifactViewer() {
  const { state } = useSidebar();

  return (
    <div className="flex">
      <SidebarTrigger
        className={cn("ml-auto mt-4", state === "expanded" && "opacity-0")}
      />
      <Sidebar side="right" className="bg-accent">
        <section className="ml-2 space-y-2 h-full">
          <div className="flex gap-4 mt-4 items-center ">
            <SidebarTrigger />
            <div className="text-sm font-medium">
              <p>Browser View</p>
            </div>
          </div>

          <SidebarContent className="border-t border-l h-full border-border bg-background rounded-tl-xl">
            hello
          </SidebarContent>
        </section>
      </Sidebar>
    </div>
  );
}
