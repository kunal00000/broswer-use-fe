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
  const [isTyping, setIsTyping] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
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

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    setIsTyping(true);
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    const viewportWidth = 1280;
    const viewportHeight = 720;

    const scaleX = viewportWidth / displayedWidth;
    const scaleY = viewportHeight / displayedHeight;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const mappedX = Math.round(clickX * scaleX);
    const mappedY = Math.round(clickY * scaleY);

    const browserInput: BrowserInput = {
      type: "click",
      x: mappedX,
      y: mappedY,
    };

    wsRef.current?.send(JSON.stringify(browserInput));
  };

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    const deltaY = e.deltaY;

    const browserInput: BrowserInput = {
      type: "scroll",
      deltaY,
    };

    wsRef.current?.send(JSON.stringify(browserInput));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTyping || !wsRef || wsRef?.current?.readyState !== WebSocket.OPEN)
        return;

      if (e.key === "Escape") {
        setIsTyping(false);
      } else if (e.key.length === 1 || e.key === "Backspace") {
        const input: BrowserInput = {
          type: "type",
          value: e.key === "Backspace" ? "{backspace}" : e.key,
        };
        wsRef.current?.send(JSON.stringify(input));
      }
    };

    if (isTyping) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTyping, wsRef]);

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

        <SidebarContent
          ref={containerRef}
          tabIndex={0}
          className="border-t border-l h-full border-border bg-background rounded-tl-xl"
        >
          {takeControl ? (
            screenshot !== null ? (
              <>
                <Image
                  ref={imageRef}
                  alt="screenshot"
                  src={screenshot}
                  width={1280}
                  height={720}
                  onClick={handleClick}
                  onWheel={handleWheel}
                  className="h-fit w-fit object-contain cursor-pointer"
                />
              </>
            ) : (
              <NoScreenshot />
            )
          ) : screenshots.length > 0 ? (
            <Image
              alt="screenshot"
              src={screenshots[screenshots.length - 1]}
              width={1280}
              height={720}
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
