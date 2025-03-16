"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSocketStore } from "@/lib/stores/socket-store";
import { ImagePlayIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { BrowserInput } from "@/lib/types";

export default function ArtifactViewer() {
  const [takeControl, setTakeControl] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const screenshots = useSocketStore((state) => state.screenshots);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/browser");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      setScreenshot(data.data);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Sidebar side="right" className="bg-accent" collapsible="offcanvas">
      <SidebarTrigger className="absolute mt-4 -ml-7 border-border rounded-r-none border border-r-0 bg-accent" />
      <section className="mx-4 space-y-2 h-full">
        <div className="flex mt-[18px] items-center">
          <div className="flex items-center justify-between w-full">
            <p className="text-base font-medium">Browser View</p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-lime-400 dark:hover:bg-lime-300"
              onClick={() => {
                const browserInput: BrowserInput = {
                  type: "stream",
                  shouldStream: !takeControl,
                };
                wsRef.current?.send(JSON.stringify(browserInput));
                setTakeControl(!takeControl);
              }}
            >
              {takeControl ? "Stop Control" : "Take Control"}
            </Button>
          </div>
        </div>

        <SidebarContent className="border-t border-l h-full border-border bg-background rounded-tl-xl">
          {takeControl ? (
            screenshot !== null ? (
              <>
                <Image
                  alt="screenshot"
                  src={screenshot}
                  width={800}
                  height={600}
                  className="h-full w-full object-contain"
                />
              </>
            ) : (
              <NoScreenshot />
            )
          ) : screenshots.length > 0 ? (
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
