"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AgentResponse, WebSocketMessage } from "@/lib/types";
import { useSocketStore } from "@/lib/stores/socket-store";

export default function Chat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messages = useSocketStore((state) => state.messages);
  const [inputValue, setInputValue] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setWs(socket);
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      //   setMessages((prev) => [...prev, event.data]);

      const wsMessage = JSON.parse(event.data) as WebSocketMessage;

      if (wsMessage.type === "AI_RESPONSE") {
        const message = JSON.parse(wsMessage.content) as AgentResponse;
        useSocketStore.setState((state) => ({
          messages: [...state.messages, message],
        }));
      } else if (wsMessage.type === "SCREENSHOT") {
        const screenshot = wsMessage.content as string;
        useSocketStore.setState((state) => ({
          screenshots: [...state.screenshots, screenshot],
        }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setWs(null);
    };

    socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (event: "USER_INPUT") => {
    if (ws && inputValue) {
      const message: WebSocketMessage = { type: event, content: inputValue };
      ws.send(JSON.stringify(message));
      setInputValue("");
    }
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          WebSocket Demo
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message"
          />
          <Button
            onClick={() => sendMessage("USER_INPUT")}
            disabled={!isConnected}
          >
            Send Message
          </Button>
          <Button
            variant="secondary"
            onClick={() => sendMessage("USER_INPUT")}
            disabled={!isConnected}
          >
            Request Screenshot
          </Button>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 font-semibold">Received Messages:</h3>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {messages.map((msg, index) => (
              <div key={index} className="py-1">
                {JSON.stringify(msg)}
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
