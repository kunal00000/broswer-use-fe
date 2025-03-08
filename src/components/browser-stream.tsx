import { useEffect, useRef, useState } from "react";

interface BrowserStreamProps {
  apiUrl?: string;
  websocketUrl?: string;
}

const BrowserStream: React.FC<BrowserStreamProps> = ({
  apiUrl = "http://localhost:8080/browser/session",
  websocketUrl = "ws://localhost:8080/browser",
}) => {
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
              setActiveTab(newTabs.length - 1); // Auto-switch to new tab
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

    const rect = img.getBoundingClientRect();
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

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
    const deltaY = e.deltaY; // Positive for scroll down, negative for scroll up
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
  }, [isTyping]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <h2>Browser Stream</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {sessionId ? (
        isConnected ? (
          <div>
            <div style={{ marginBottom: "10px" }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    sendInteraction("switchTab");
                  }}
                  style={{
                    padding: "5px 10px",
                    marginRight: "5px",
                    fontWeight: activeTab === tab ? "bold" : "normal",
                    backgroundColor: activeTab === tab ? "#ddd" : "#fff",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  Tab {tab + 1}
                </button>
              ))}
              <button
                onClick={() => sendInteraction("newTab")}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                New Tab
              </button>
            </div>
            <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
              {screenshot ? (
                <img
                  ref={imageRef}
                  src={screenshot}
                  alt="Browser Stream"
                  onClick={handleClick}
                  onWheel={handleWheel} // Add wheel event for scrolling
                  style={{ maxWidth: "100%", cursor: "pointer" }}
                />
              ) : (
                <p>Loading browser stream...</p>
              )}
            </div>
            {isTyping && (
              <p style={{ marginTop: "10px", color: "blue" }}>
                Typing mode active (Press Escape to exit)
              </p>
            )}
          </div>
        ) : (
          <p>Connecting to WebSocket...</p>
        )
      ) : (
        <p>Creating browser session...</p>
      )}
    </div>
  );
};

export default BrowserStream;
