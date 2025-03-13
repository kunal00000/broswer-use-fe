// components/artifact.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useWebSocket } from "@/lib/providers/websocker-provider";
import { useSocketStore } from "@/lib/stores/socket-store";
import { ImagePlayIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ArtifactViewer() {
  const { ws } = useWebSocket();
  const screenshots = useSocketStore((state) => state.screenshots);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "SCREENSHOT") {
          setScreenshot(data.content);
        }
        if (data.error) setError(data.error);
      };
    }
  }, [ws]);

  const sendInteraction = (
    type: string,
    x?: number,
    y?: number,
    value?: string,
    deltaY?: number
  ) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError("WebSocket not connected");
      return;
    }
    ws.send(
      JSON.stringify({
        type: "BROWSER_INPUT",
        data: { type, x, y, value, deltaY },
      })
    );
  };

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const mappedX = Math.round(clickX);
    const mappedY = Math.round(clickY);

    sendInteraction("click", mappedX, mappedY);
    setTimeout(() => setIsTyping(true), 100);
  };

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    const deltaY = e.deltaY;
    sendInteraction("scroll", undefined, undefined, undefined, deltaY);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTyping || !ws || ws.readyState !== WebSocket.OPEN) return;

      if (e.key === "Escape") {
        setIsTyping(false);
      } else if (e.key.length === 1 || e.key === "Backspace") {
        sendInteraction(
          "type",
          undefined,
          undefined,
          e.key === "Backspace" ? "{backspace}" : e.key
        );
      }
    };

    if (isTyping) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTyping, ws]);

  return (
    <Sidebar side="right" className="bg-accent" collapsible="offcanvas">
      <SidebarTrigger className="absolute mt-4 -ml-7 border-border rounded-r-none border border-r-0 bg-accent" />
      <section className="ml-2 space-y-2 h-full">
        <div className="flex mt-[18px] items-center">
          <div className="text-base font-medium">
            <p>Browser View</p>
          </div>
        </div>
        <SidebarContent className="border-t border-l h-full border-border bg-background rounded-tl-xl">
          {error && <p className="text-red-500 p-2">{error}</p>}
          {ws ? (
            <>
              {screenshot ? (
                <Image
                  ref={imageRef}
                  alt="Browser Stream"
                  src={screenshot}
                  width={1280}
                  height={720}
                  onClick={handleClick}
                  onWheel={handleWheel}
                  className="h-fit w-fit object-contain cursor-pointer"
                />
              ) : screenshots.length > 0 ? (
                <Image
                  alt="screenshot"
                  src={screenshots[screenshots.length - 1]}
                  width={1280}
                  height={720}
                  className="h-fit w-fit object-contain"
                />
              ) : (
                <div className="h-full w-full">
                  <NoScreenshot />
                </div>
              )}
              {isTyping && (
                <p className="text-blue-500 p-2">
                  Typing mode active (Press Escape to exit)
                </p>
              )}
            </>
          ) : (
            <p className="p-2">Connecting to WebSocket...</p>
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
