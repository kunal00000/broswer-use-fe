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

interface BrowserViewProps {
  apiUrl?: string;
  websocketUrl?: string;
}

export default function ArtifactViewer({
  apiUrl = "http://localhost:8080/browser/session",
  websocketUrl = "ws://localhost:8080/browser",
}: BrowserViewProps) {
  const screenshots = useSocketStore((state) => state.screenshots);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [viewport, setViewport] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to create browser session");
        const data = await res.json();
        if (!isMounted) return;

        setSessionId(data.sessionId);

        const ws = new WebSocket(websocketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          ws.send(JSON.stringify({ sessionId: data.sessionId }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.tabs) {
            const newTabs = Array.from({ length: data.tabs }, (_, i) => i);
            setTabs(newTabs);
            if (newTabs.length > tabs.length) {
              setActiveTab(newTabs.length - 1);
            }
          }
          if (data.type === "screenshot") {
            setScreenshot(data.content);
            setViewport(data.viewport);
          }
          if (data.activeTab !== undefined) setActiveTab(data.activeTab);
          if (data.error) setError(data.error);
        };

        ws.onerror = () => setError("WebSocket connection failed");
        ws.onclose = () => {
          if (isMounted) {
            setIsConnected(false);
            setError("WebSocket connection closed");
          }
        };
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, websocketUrl]);

  const sendInteraction = (
    type: string,
    x?: number,
    y?: number,
    value?: string,
    deltaY?: number
  ) => {
    if (
      !sessionId ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      setError("WebSocket not connected");
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        sessionId,
        type,
        x,
        y,
        value,
        deltaY,
        tabIndex: activeTab,
      })
    );
  };

  const handleClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img || !viewport) return;
    console.log({ viewport });
    const rect = img.getBoundingClientRect();
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    console.log({ displayedWidth, displayedHeight });

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = viewport.width / displayedWidth;
    const scaleY = viewport.height / displayedHeight;
    const mappedX = Math.round(clickX * scaleX);
    const mappedY = Math.round(clickY * scaleY);

    sendInteraction("click", mappedX, mappedY);
    setTimeout(() => setIsTyping(true), 100);
  };

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    const deltaY = e.deltaY;
    sendInteraction("scroll", undefined, undefined, undefined, deltaY);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !isTyping ||
        !wsRef.current ||
        wsRef.current.readyState !== WebSocket.OPEN
      )
        return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping]);

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
          {sessionId ? (
            isConnected ? (
              <>
                <div className="p-2 flex gap-2 flex-wrap">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        sendInteraction("switchTab");
                      }}
                      className={`px-2 py-1 rounded ${
                        activeTab === tab ? "bg-gray-200 font-bold" : "bg-white"
                      } border border-gray-300`}
                    >
                      Tab {tab + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => sendInteraction("newTab")}
                    className="px-2 py-1 bg-green-500 text-white rounded border-none"
                  >
                    New Tab
                  </button>
                </div>
                {screenshot ? (
                  <Image
                    ref={imageRef}
                    alt="Browser Stream"
                    src={screenshot}
                    width={800}
                    height={600}
                    onClick={handleClick}
                    onWheel={handleWheel}
                    className="h-fit w-fit object-contain cursor-pointer"
                  />
                ) : screenshots.length > 0 ? (
                  <Image
                    alt="screenshot"
                    src={screenshots[screenshots.length - 1]}
                    width={800}
                    height={600}
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
            )
          ) : (
            <p className="p-2">Creating browser session...</p>
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
