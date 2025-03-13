// components/WebSocketProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWs(socket);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
