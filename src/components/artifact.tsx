"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSocketStore } from "@/lib/stores/socket-store";
import { cn } from "@/lib/utils";
import { ImagePlayIcon } from "lucide-react";
import Image from "next/image";

export default function ArtifactViewer() {
  const screenshots = useSocketStore((state) => state.screenshots);

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
            {screenshots.length > 0 ? (
              <Image
                alt="screenshot"
                src={screenshots[screenshots.length - 1]}
                width={800}
                height={600}
                className="h-full w-full object-contain"
              />
            ) : (
              <NoScreenshot />
            )}
          </SidebarContent>
        </section>
      </Sidebar>
    </div>
  );
}

function NoScreenshot() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center">
        <ImagePlayIcon className="h-10 w-10 text-primary" />
        <p className="text-muted-foreground text-lg font-medium mt-3">
          No screenshots available
        </p>
      </div>
    </div>
  );
}
